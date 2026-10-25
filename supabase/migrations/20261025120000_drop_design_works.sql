-- The homepage no longer has a Design work section. Its table held only the three
-- rows seeded by 20261025090000_site_content.sql; images were never uploaded to
-- storage (site/design/*), so there is nothing else to clean up.
drop table public.design_works;
