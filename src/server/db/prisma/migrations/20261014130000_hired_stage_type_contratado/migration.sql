-- The "Contratado/a" stage is stored with type "Contratado" instead of "Ninguna".
UPDATE "job_opening"
SET "stages" = (
  SELECT jsonb_agg(
    CASE
      WHEN s.stage->>'name' = 'Contratado/a' AND s.stage->>'type' = 'Ninguna'
        THEN jsonb_set(s.stage, '{type}', '"Contratado"')
      ELSE s.stage
    END
    ORDER BY s.position
  )
  FROM jsonb_array_elements("job_opening"."stages") WITH ORDINALITY AS s(stage, position)
)
WHERE jsonb_typeof("stages") = 'array'
  AND "stages" @> '[{"name": "Contratado/a", "type": "Ninguna"}]'::jsonb;

UPDATE "stage_template"
SET "stages" = (
  SELECT jsonb_agg(
    CASE
      WHEN s.stage->>'name' = 'Contratado/a' AND s.stage->>'type' = 'Ninguna'
        THEN jsonb_set(s.stage, '{type}', '"Contratado"')
      ELSE s.stage
    END
    ORDER BY s.position
  )
  FROM jsonb_array_elements("stage_template"."stages") WITH ORDINALITY AS s(stage, position)
)
WHERE jsonb_typeof("stages") = 'array'
  AND "stages" @> '[{"name": "Contratado/a", "type": "Ninguna"}]'::jsonb;
