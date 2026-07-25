"""add profile fields to home_team_members

Revision ID: b1c4a7e2f6d9
Revises: 0003ec3d2a84
Create Date: 2026-07-25 10:00:00.000000

"""
import re
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b1c4a7e2f6d9'
down_revision = '0003ec3d2a84'
branch_labels = None
depends_on = None


def _slugify(name):
    slug = re.sub(r'[^a-z0-9]+', '-', (name or '').lower()).strip('-')
    return slug or 'team-member'


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    cols = [c['name'] for c in inspector.get_columns('home_team_members')]

    with op.batch_alter_table('home_team_members', schema=None) as batch_op:
        if 'slug' not in cols:
            batch_op.add_column(sa.Column('slug', sa.String(length=180), nullable=True))
        if 'about' not in cols:
            batch_op.add_column(sa.Column('about', sa.Text(), nullable=True))
        if 'achievements' not in cols:
            batch_op.add_column(sa.Column('achievements', sa.Text(), nullable=True))

    if 'slug' not in cols:
        with op.batch_alter_table('home_team_members', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_home_team_members_slug'), ['slug'], unique=True)

        members = sa.table('home_team_members', sa.column('id', sa.Integer), sa.column('name', sa.String), sa.column('slug', sa.String))
        rows = conn.execute(sa.select(members.c.id, members.c.name)).fetchall()
        used = set()
        for row in rows:
            base = _slugify(row.name)
            slug = base
            i = 2
            while slug in used:
                slug = f'{base}-{i}'
                i += 1
            used.add(slug)
            conn.execute(members.update().where(members.c.id == row.id).values(slug=slug))


def downgrade():
    with op.batch_alter_table('home_team_members', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_home_team_members_slug'))
        batch_op.drop_column('achievements')
        batch_op.drop_column('about')
        batch_op.drop_column('slug')
