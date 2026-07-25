from app import db
from app.models import Chapter, ChapterProgress


def completed_chapter_ids(user_id, course_id):
    """Set of active-chapter ids the user has marked watched for a course."""
    rows = db.session.query(ChapterProgress.chapter_id).join(
        Chapter, Chapter.id == ChapterProgress.chapter_id
    ).filter(
        ChapterProgress.user_id == user_id,
        Chapter.course_id == course_id,
        Chapter.is_active.is_(True),
    ).all()
    return {r[0] for r in rows}


def course_progress(user_id, course):
    """{total, completed, percent, is_completed} for one course + user."""
    total = course.chapters.filter_by(is_active=True).count()
    if total == 0:
        return {'total': 0, 'completed': 0, 'percent': 0, 'is_completed': False}
    completed = len(completed_chapter_ids(user_id, course.id))
    return {
        'total': total,
        'completed': completed,
        'percent': round(completed / total * 100),
        'is_completed': completed >= total,
    }


def is_course_completed(user_id, course_id):
    from app.models import Course
    course = Course.query.get(course_id)
    if not course:
        return False
    return course_progress(user_id, course)['is_completed']


def mark_chapter_complete(user_id, chapter_id):
    """Idempotently record that a user finished a chapter.

    Returns (entry, created) — created is False on a repeat call for the
    same chapter, which callers use to avoid re-firing "course completed"
    side effects (e.g. notifications) on every rewatch.
    """
    existing = ChapterProgress.query.filter_by(user_id=user_id, chapter_id=chapter_id).first()
    if existing:
        return existing, False
    entry = ChapterProgress(user_id=user_id, chapter_id=chapter_id)
    db.session.add(entry)
    db.session.commit()
    return entry, True
