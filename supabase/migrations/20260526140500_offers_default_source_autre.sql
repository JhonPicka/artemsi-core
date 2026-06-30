-- ARTEMSI V1 n'utilise plus l'ancienne source externe historique par defaut.
-- Les anciennes lignes restent lisibles via l'enum existant, mais les nouvelles
-- offres creees directement en base prennent desormais la source neutre "autre".

alter table public.offers
  alter column source set default 'autre'::public.offer_source;
