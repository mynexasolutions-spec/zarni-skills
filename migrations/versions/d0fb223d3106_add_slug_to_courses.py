"""add slug to courses

Revision ID: d0fb223d3106
Revises: 7a0513996246
Create Date: 2026-07-24 12:00:00.000000

"""
import re
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd0fb223d3106'
down_revision = '7a0513996246'
branch_labels = None
depends_on = None


def _slugify(name):
    slug = re.sub(r'[^a-z0-9]+', '-', (name or '').lower()).strip('-')
    return slug or 'course'


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    course_cols = [c['name'] for c in inspector.get_columns('courses')]
    if 'slug' not in course_cols:
        with op.batch_alter_table('courses', schema=None) as batch_op:
            batch_op.add_column(sa.Column('slug', sa.String(length=180), nullable=True))
            batch_op.create_index(batch_op.f('ix_courses_slug'), ['slug'], unique=True)

    courses = sa.table('courses', sa.column('id', sa.Integer), sa.column('title', sa.String), sa.column('slug', sa.String))
    rows = conn.execute(sa.select(courses.c.id, courses.c.title)).fetchall()
    used = set()
    for row in rows:
        base = _slugify(row.title)
        slug = base
        i = 2
        while slug in used:
            slug = f'{base}-{i}'
            i += 1
        used.add(slug)
        conn.execute(courses.update().where(courses.c.id == row.id).values(slug=slug))


def downgrade():
    with op.batch_alter_table('courses', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_courses_slug'))
        batch_op.drop_column('slug')
