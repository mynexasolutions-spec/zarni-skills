"""add slug to instructors

Revision ID: 7a0513996246
Revises: ce03cc7f8abc
Create Date: 2026-07-24 11:00:00.000000

"""
import re
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7a0513996246'
down_revision = 'ce03cc7f8abc'
branch_labels = None
depends_on = None


def _slugify(name):
    slug = re.sub(r'[^a-z0-9]+', '-', (name or '').lower()).strip('-')
    return slug or 'instructor'


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    instructor_cols = [c['name'] for c in inspector.get_columns('instructors')]
    if 'slug' not in instructor_cols:
        with op.batch_alter_table('instructors', schema=None) as batch_op:
            batch_op.add_column(sa.Column('slug', sa.String(length=180), nullable=True))
            batch_op.create_index(batch_op.f('ix_instructors_slug'), ['slug'], unique=True)

    # Backfill slugs for any existing instructor rows so old numeric-id links
    # keep working once the API switches to slug-based lookups.
    instructors = sa.table('instructors', sa.column('id', sa.Integer), sa.column('name', sa.String), sa.column('slug', sa.String))
    rows = conn.execute(sa.select(instructors.c.id, instructors.c.name)).fetchall()
    used = set()
    for row in rows:
        base = _slugify(row.name)
        slug = base
        i = 2
        while slug in used:
            slug = f'{base}-{i}'
            i += 1
        used.add(slug)
        conn.execute(instructors.update().where(instructors.c.id == row.id).values(slug=slug))


def downgrade():
    with op.batch_alter_table('instructors', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_instructors_slug'))
        batch_op.drop_column('slug')
