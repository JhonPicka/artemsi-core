-- Migre l'ancien format application_guide (cvEssentials, questions…) vers { tips: string[] }.

update public.offers o
set application_guide = converted.new_guide
from (
  select
    id,
    jsonb_build_object(
      'tips',
      coalesce(
        (
          select jsonb_agg(item order by ord)
          from (
            select item, min(ord) as ord
            from (
              select trim(value) as item, row_number() over () as ord
              from (
                select jsonb_array_elements_text(
                  coalesce(application_guide->'cvEssentials'->'competencies', '[]'::jsonb)
                ) as value
                union all
                select jsonb_array_elements_text(
                  coalesce(application_guide->'cvEssentials'->'keyFacts', '[]'::jsonb)
                )
                union all
                select jsonb_array_elements_text(
                  coalesce(application_guide->'cvEssentials'->'education', '[]'::jsonb)
                )
                union all
                select jsonb_array_elements_text(
                  coalesce(application_guide->'cvEssentials'->'profile', '[]'::jsonb)
                )
                union all
                select jsonb_array_elements_text(
                  coalesce(application_guide->'letterAngles', '[]'::jsonb)
                )
              ) all_vals
              where length(trim(value)) >= 2
            ) numbered
            group by item
            order by min(ord)
            limit 6
          ) limited
        ),
        '[]'::jsonb
      )
    ) as new_guide
  from public.offers
  where application_guide is not null
    and application_guide ? 'cvEssentials'
) converted
where o.id = converted.id
  and jsonb_array_length(coalesce(converted.new_guide->'tips', '[]'::jsonb)) > 0;

-- Offres sans tips exploitables apres conversion : on retire le guide obsolete.
update public.offers
set application_guide = null
where application_guide is not null
  and application_guide ? 'cvEssentials';

-- La colonne keywords (doublon du raccourci) n'est plus alimentee.
update public.offers
set keywords = null
where keywords is not null;
