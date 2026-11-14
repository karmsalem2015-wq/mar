# MAR — admin permission rollout (do not skip)

The new server-side guards are intentionally deny-by-default for users without a
protected `app_metadata.mar_role` claim. Values: `super_admin`, `admin`, `editor`.
User-controlled `user_metadata` must not contain trusted authorization claims.

Before merging to main:
1. Back up the live MAR Supabase RLS policies.
2. Assign an existing verified administrator `mar_role: "super_admin"` through the
   Supabase Auth Admin API/dashboard — not a public user profile.
3. Review and apply `supabase-migration-mar-admin-authorization.sql` only to the
   correct MAR database. It is included but NOT executed by this commit.
4. Refresh user JWT sessions. Test super_admin, editor, signed-in non-admin, anonymous user.
5. Verify public published property/project pages and inquiries still work; unpublished
   content stays private; admin CRUD, media, settings and users work only as authorized.
6. Do not merge to production until all checks pass.

Permissions are in `app_metadata.mar_permissions`; old
`user_metadata.permissions` is not trusted. The SQL migration is an explicit
production prerequisite because existing broad RLS policies need removal.
