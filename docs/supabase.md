# Supabase — ranking de la jornada

El ranking en vivo (el que ve el facilitador desde su PC con los alumnos de
todas las máquinas del laboratorio) necesita Supabase. Sin él la app funciona
igual, pero el ranking es el de cada PC por separado.

## 1. Correr este SQL

En el proyecto de Supabase → **SQL Editor** → pegar y ejecutar:

```sql
create table if not exists participantes (
  id              text primary key,          -- uuid generado en el navegador
  numero_colegio  int  not null check (numero_colegio between 1 and 20),
  nombre          text not null,
  colegio         text not null,
  -- { "codigo-cero": { "puntaje": 720, "tiempoSeg": 380 }, ... }
  misiones        jsonb not null default '{}'::jsonb,
  puntaje_total   int  not null default 0 check (puntaje_total between 0 and 10000),
  tiempo_total_seg int not null default 0 check (tiempo_total_seg >= 0),
  creado_en       timestamptz default now(),
  actualizado_en  timestamptz default now()
);

-- El ranking se lee ordenado por total y desempata por tiempo.
create index if not exists participantes_ranking_idx
  on participantes (numero_colegio, puntaje_total desc, tiempo_total_seg asc);

-- Cada guardado refresca la marca de tiempo.
create or replace function tocar_actualizado_en() returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists participantes_tocar on participantes;
create trigger participantes_tocar before update on participantes
  for each row execute function tocar_actualizado_en();
```

## 2. Activar RLS (esto NO es opcional)

**El repositorio es público y la key publicable viaja en el bundle** — eso es
normal en Supabase, pero significa que RLS es lo único que separa "una tabla de
un taller" de "una tabla que cualquiera puede borrar". Sin estas policies, la
key sola da acceso total.

```sql
alter table participantes enable row level security;

-- Leer el ranking: público (lo lee el juego y el panel del facilitador).
create policy "participantes_select_publico" on participantes
  for select using (true);

-- Registrarse y actualizar el propio progreso: público, porque el alumno no
-- tiene cuenta. Es el upsert que hace el juego al terminar cada misión.
create policy "participantes_insert_publico" on participantes
  for insert with check (true);

create policy "participantes_update_publico" on participantes
  for update using (true) with check (true);

-- Sin policy de DELETE a propósito: nadie puede borrar filas con la key
-- publicable.
```

**Qué queda expuesto, con honestidad:** cualquiera con la key (o sea, cualquiera
que abra el sitio) puede insertar filas o modificar una existente. Los `check`
del esquema frenan el intento obvio de meter un puntaje absurdo, pero alguien
motivado podría escribir un total limpio. Con premios simbólicos no vale la pena
defenderse más; la mitigación real es que **el facilitador confirme el top 3
contra lo que vio en el aula** antes de premiar. Si algún día los premios suben
de valor, el paso siguiente es mover la escritura a una Edge Function con
service_role y dejar la tabla sin INSERT/UPDATE público.

## 3. Credenciales

Hoy la URL y la key publicable están como valores por defecto en
`src/lib/supabase.js`, así que el sitio desplegado funciona sin configurar nada.

Para desarrollo local se pueden sobreescribir con `.env.local` (ignorado por
git, ver `.env.local.example`):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxx
```

Si preferís que las credenciales **no** vivan en el código, el camino es
guardarlas como *secrets* del repositorio y pasarlas al build en
`.github/workflows/deploy-pages.yml`:

```yaml
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

Ojo: la key termina igual dentro del JS público en los dos casos (es un sitio
estático). Lo que cambia es si queda además en el historial de git.

## 4. Panel del facilitador

Se abre por URL, no está en el flujo del alumno:

- Todas las rondas: `…/OpenDay2026Software/?vista=leaderboard`
- Una ronda: `…/OpenDay2026Software/?vista=leaderboard&colegio=7`

Se refresca solo cada 3 segundos. No usa Supabase Realtime a propósito (§8 de la
propuesta): un `SELECT` periódico es más simple y aguanta mejor un wifi malo.

Si Supabase no responde, el panel lo dice en pantalla y muestra lo que haya
guardado localmente, en vez de mostrar una tabla vacía como si nadie hubiera
jugado.

## 5. Cómo verificar que quedó bien

Con el SQL corrido, desde la terminal:

```bash
curl -s "$URL/rest/v1/participantes?select=id&limit=1" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
```

- `[]` → la tabla existe y se puede leer. Listo.
- `{"code":"PGRST205"...}` → falta correr el SQL del paso 1.
- `{"code":"42501"...}` → falta la policy de SELECT del paso 2.
