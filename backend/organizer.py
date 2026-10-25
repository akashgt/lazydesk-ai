import os
import shutil
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from pydantic import BaseModel, Field

class PlannedAction(BaseModel):
    action_id: str
    source_path: str
    destination_path: str
    operation_type: str  # "move_and_rename", "move", "rename"
    proposed_category: str
    explanation: str
    is_safe: bool = True
    safety_notes: Optional[str] = None
    status: str = "pending"  # "pending", "executed", "skipped", "failed"
    error_message: Optional[str] = None

class ActionPlan(BaseModel):
    workspace_root: str
    actions: List[PlannedAction]
    total_actions: int
    is_dry_run: bool = True

class ExecutionResult(BaseModel):
    session_id: str
    workspace_root: str
    total_requested: int
    succeeded_count: int
    failed_count: int
    skipped_count: int
    actions: List[PlannedAction]

def resolve_collision_path(target_path: Path) -> Path:
    """If target_path exists, generates a non-colliding candidate: name_1.ext, name_2.ext, etc."""
    if not target_path.exists():
        return target_path

    parent = target_path.parent
    stem = target_path.stem
    suffix = target_path.suffix

    counter = 1
    while True:
        candidate = parent / f"{stem}_{counter}{suffix}"
        if not candidate.exists():
            return candidate
        counter += 1

def validate_path_safety(workspace_root: Path, target_path: Path) -> Tuple[bool, Optional[str]]:
    """
    Strictly verifies that target_path cannot escape workspace_root.
    Protects against path traversal (e.g. '../', absolute path escapes, symlink tricks).
    """
    try:
        resolved_root = workspace_root.resolve()
        resolved_target = target_path.resolve()

        # Check commonpath
        common = Path(os.path.commonpath([resolved_root, resolved_target]))
        if common != resolved_root:
            return False, f"Security violation: path '{target_path}' escapes workspace root '{workspace_root}'."

        return True, None
    except Exception as e:
        return False, f"Path resolution failed: {str(e)}"

def create_action_plan(
    workspace_root: str | Path,
    suggestions: List[Dict[str, str]]
) -> ActionPlan:
    """
    Transforms file organization suggestions into a validated, dry-run action plan.
    Ensures safe category folders and unique collision-free destinations.
    """
    root = Path(workspace_root).resolve()
    actions: List[PlannedAction] = []

    # Keep track of planned destinations in this batch to prevent internal batch collisions
    planned_destinations: set[str] = set()

    for idx, s in enumerate(suggestions):
        src_path = Path(s["original_path"]).resolve()
        prop_name = s.get("proposed_name") or src_path.name
        prop_cat = s.get("proposed_category") or "Miscellaneous"
        explanation = s.get("explanation") or "Organized by LazyDesk."

        # Category folder under workspace root
        cat_dir = root / prop_cat
        candidate_dest = cat_dir / prop_name

        is_safe, safety_err = validate_path_safety(root, candidate_dest)

        # Resolve on-disk collision
        safe_dest = resolve_collision_path(candidate_dest)

        # Also handle collision with another item in the same batch
        counter = 1
        stem = safe_dest.stem
        suffix = safe_dest.suffix
        while str(safe_dest) in planned_destinations:
            safe_dest = cat_dir / f"{stem}_{counter}{suffix}"
            counter += 1

        planned_destinations.add(str(safe_dest))

        op_type = "move"
        if safe_dest.name != src_path.name:
            op_type = "move_and_rename"

        actions.append(PlannedAction(
            action_id=f"act_{idx + 1}",
            source_path=str(src_path),
            destination_path=str(safe_dest),
            operation_type=op_type,
            proposed_category=prop_cat,
            explanation=explanation,
            is_safe=is_safe,
            safety_notes=safety_err,
            status="pending"
        ))

    return ActionPlan(
        workspace_root=str(root),
        actions=actions,
        total_actions=len(actions),
        is_dry_run=True,
    )

def execute_action_plan(
    action_plan: ActionPlan,
    approved_action_ids: Optional[List[str]] = None
) -> ExecutionResult:
    """
    Safely executes only approved actions.
    Never modifies unapproved files.
    Creates destination directories on-demand.
    Records errors per action without aborting the entire batch.
    """
    import uuid
    session_id = f"sess_{uuid.uuid4().hex[:10]}"
    root = Path(action_plan.workspace_root).resolve()

    approved_set = set(approved_action_ids) if approved_action_ids is not None else {a.action_id for a in action_plan.actions}

    succeeded = 0
    failed = 0
    skipped = 0

    executed_actions: List[PlannedAction] = []

    for action in action_plan.actions:
        # Check approval
        if action.action_id not in approved_set:
            action.status = "skipped"
            action.error_message = "Skipped by user."
            skipped += 1
            executed_actions.append(action)
            continue

        # Check safety
        if not action.is_safe:
            action.status = "failed"
            action.error_message = f"Skipped unsafe action: {action.safety_notes}"
            failed += 1
            executed_actions.append(action)
            continue

        src = Path(action.source_path)
        dest = Path(action.destination_path)

        # Source must exist
        if not src.exists() or not src.is_file():
            action.status = "failed"
            action.error_message = f"Source file no longer exists: {src}"
            failed += 1
            executed_actions.append(action)
            continue

        # Re-verify path safety immediately before disk operation
        is_safe, sec_err = validate_path_safety(root, dest)
        if not is_safe:
            action.status = "failed"
            action.error_message = f"Pre-execution security failure: {sec_err}"
            failed += 1
            executed_actions.append(action)
            continue

        try:
            # Ensure target parent directory exists
            dest.parent.mkdir(parents=True, exist_ok=True)

            # Re-check collision immediately before move
            final_dest = resolve_collision_path(dest)
            action.destination_path = str(final_dest)

            # Move file
            shutil.move(str(src), str(final_dest))
            action.status = "executed"
            succeeded += 1

        except Exception as e:
            action.status = "failed"
            action.error_message = f"Disk move failed: {str(e)}"
            failed += 1

        executed_actions.append(action)

    return ExecutionResult(
        session_id=session_id,
        workspace_root=str(root),
        total_requested=len(action_plan.actions),
        succeeded_count=succeeded,
        failed_count=failed,
        skipped_count=skipped,
        actions=executed_actions,
    )
