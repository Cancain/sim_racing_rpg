# Sim Racing Career — Spec

Cross-platform desktop-app som simulerar en **verklig racingkarriär** ovanpå iRacings offline AI-läge. Du spelar rollen av en förare som klättrar genom verkliga motorsport-ligor. Appen underhåller en levande roster av namngivna AI-rivaler, synkar den till iRacing, du kör varje race offline mot den rostern, rapporterar resultat via screenshot, och appen driver karriären framåt — progression, kontrakt, ligabyten och dynamiska events mellan race.

---

## Vision

Den här appen simulerar en **verklig racingkarriär** ovanpå iRacings offline AI-läge. Du spelar rollen av en förare som klättrar genom verkliga motorsport-ligor. Appen genererar en levande AI-roster — namngivna rivaler med sina egna karriärer, som åldras, byter team, och går i pension — och synkar den till iRacing. Du kör varje race offline mot denna roster, rapporterar resultat, och appen driver karriären framåt med progression, kontrakt, ligabyten och dynamiska events mellan race.

### Designprinciper

- **Plausibel realism med dramatiskt utrymme.** Ligor, team, sponsorer och events bygger på riktig motorsport, men narrativ och dramatik får styra där verklig data saknas.
- **iRacing-native, offline-first.** Appen är byggd exklusivt för iRacings offline AI. Inga andra simulatorer, inga officiella races, inga hosted sessions — bara du, iRacings AI, och appens karriärlogik.
- **Levande AI-ekosystem.** De andra förarna i ligorna är inte anonyma siffror — de har namn, ålder, personlighet och karriärer som utvecklas parallellt med din.
- **Rollspel över siffror.** Du spelar en förare — val, personlighet och långsiktiga konsekvenser är lika viktiga som positioner och varvtider.
- **Appen validerar aldrig resultat — användarens input är sanning.**
- **Lokal först.** All data sparas lokalt (förutom iRacing API-anrop och Claude API-anrop); cloud-sync eventuellt senare.

### Det här är inte:

- **En telemetri- eller setup-analyzer** — appen bryr sig inte om *hur* du körde, bara slutresultatet.
- **En coaching-app** — inga tips om linjeval, bromspunkter eller förarteknik.
- **En multiplayer- eller social plattform** — ingen delning, inga leaderboards, ingen community-feed.
- **Ett esports-verktyg** — ingen koppling till officiella ligor eller live-tävlingar.
- **En sim-stat-tracker** — spårar inte totala timmar, antal varv eller din progression i själva simulatorn.
- **Sim-integrerad i MVP** — läser inte simulatorers loggfiler eller API:er i första versionen, men integrationer är planerade senare.
- **En realtidsapp** — du öppnar den mellan race, inte medan du kör.
- **En ekonomisimulator** — pengar abstraheras genom kontrakt, sponsorer och team-budget; det finns ingen personlig kassa att spendera.

---

## Målanvändare

Sim-racers som:
- Har ett aktivt iRacing-abonnemang
- Föredrar offline AI-racing — vill ha en avslappnad solo-karriär, inte stressen av officiella races
- Vill ha en strukturerad karriär med mening mellan race
- Vill ha ett långsiktigt projekt, inte "en till random race"
- Uppskattar narrativ och vill göra karriärval, inte bara se siffror

---

## Simulator: iRacing (offline AI)

Appen är byggd **exklusivt för iRacing**, och specifikt för **offline AI-läget**. Inga andra simulatorer, inga officiella races eller hosted sessions — bara du, iRacings AI, och appens karriärlogik.

### Begränsning till road-kategorin

Appen täcker iRacings **road-kategori** (Sports Car + Formula). Inkluderat: GT3, GT4, LMP2, Hypercar, Formula 4/Regional/3/2/1-ekvivalenter, TCR, Touring. **Inte inkluderat:** oval, dirt, rally.

### iRacing Data API — content-sync

Appen integrerar med `members-ng.iracing.com` för att hämta:
- **Content-katalog:** alla iRacing road-bilar och road-banor
- **Content-ägande:** vilka bilar och banor *du* äger

Vid första start loggar du in med dina iRacing-uppgifter (lagras i OS keychain via `keytar`). Vid varje följande start synkar appen i bakgrunden — nya köp dyker upp automatiskt, och iRacings senaste content-tillägg hamnar i katalogen. Appen kräver internet, vilket iRacing redan gör.

**Manuell content-justering om API-sync missar något:**
- Checkbox-lista i settings med hela road-innehållet
- Alternativ: drag-and-drop screenshot från "My Content"-sidan → LLM parsar → förkryssar åt dig

### Roster-sync — appens centrala mekanik

Appen underhåller en **levande roster** av ~130–150 namngivna AI-förare med karriärer. Rostern synkas till iRacing så de förare du kör mot på banan matchar de förare appen spårar.

**Hur sync görs** beror på vad iRacings API tillåter. Prioriterad ordning:
1. **Programmatisk sync via API** (bäst men osäkert om möjligt)
2. **Roster-fil exporteras till disk → manuell import i iRacing-UI** (en gång per liga/championship)
3. **Fallback:** om roster-skapning inte går alls — iRacings default AI körs, och appen mappar post-race via LLM (mindre immersivt)

> **Tekniskt beslut som måste verifieras först:** Innan vi bygger ut hela roster-system-arkitekturen måste vi testa vad iRacings API/filformat faktiskt tillåter. Detta blir **steg 1 i MVP-bygget**.

### Race-setup: appen föreslår, du bestämmer

Inför varje race visar appen rekommenderade iRacing-inställningar:
- Bana + layout
- Bil (från ditt ägda content)
- AI-grid-storlek (matchar antal rostern-förare i ligan)
- AI-svårighet
- Race-längd — rekommenderad men **ändringsbar** (iRacing saknar mid-race-save)
- Väder + tid
- Start-typ (rolling/standing)

Efter racet rapporterar du **tre screenshots per weekend**: practice, qualifying, race. LLM parsar alla tre, inklusive AI-förarnas placeringar.

### Datamodell för iRacing-content (skiss, detaljeras i Teknisk arkitektur)

- `car` — id, iracing_id, namn, klass, kategori
- `track` — id, iracing_id, namn, land, layout, kategori
- `ownership` — vilka cars/tracks användaren äger (populerad från API)

---

## MVP — första versionen

Scope: en komplett första karriär från debut till säsongsavslut, med levande AI-ekosystem men utan dynamiska events.

1. **Steg 0 — Verifiera iRacing roster-sync-möjligheter** (teknisk spike innan UI-arbete)
2. **iRacing-koppling** — logga in, synka ägt content, bygg content-katalogen
3. **Skapa karriär**
   - Välj disciplin (GT / Formula / Touring) — styr racing-stegen
   - Förarnamn, nationalitet, ålder
   - Personlighets-setup: svara på ~8 frågor → fördelade stats → finjustera med point-buy
   - Start alltid längst ner i disciplinens stege, baserat på iRacings gratis-content
4. **AI-roster genereras** — ~130–150 namngivna förare fördelade över alla ligor i disciplinen + free agents. Roster-fil exporteras/synkas till iRacing (metod enligt roster-sync-sektion).
5. **In-game kalender** — appen startar ett visst datum och tickar fram datum mellan races. Kalendern visar kommande race (bana, datum, liga, teamkollega, grid-storlek).
6. **Pre-race briefing** — appen rekommenderar iRacing-setup (bana, bil, AI, längd, väder, start-typ). Du kan ändra innan du sätter upp racet i iRacing.
7. **Rapportera resultat via screenshot** — tre screenshots per weekend (practice, qualifying, race). LLM parsar alla tre inklusive AI-förarnas placeringar.
8. **Standings** — liga-tabellen uppdateras; du ser också enskilda AI-förares form över tid.
9. **Bakgrundssimulering av övriga ligor** — ligor du inte kör i tickas fram parallellt; AI-förare där simuleras utifrån sina stats så ekosystemet hålls levande.
10. **Avsluta-säsong-flöde** — säsongssammanfattning, promotion/relegation, kontraktsförhandlingar, roster-rörelser (förare byter ligor/team, några pensioneras, nya rookies + free agents tar plats).
11. **Persistens** — allt i lokal SQLite-databas.

### Inte i MVP

- Dynamiska events mellan race (→ fas 2)
- Personliga rivaler som långvariga story-trådar (→ fas 2)
- Nyhetsflöde för andra förares karriärer + favoritmarkering (→ fas 2)
- Practice-mål och bonusar (→ fas 2, som event-mall)
- Sponsorsystem (→ fas 3)
- Multi-driver endurance (co-driver-stints) — single-driver i MVP; utvärderas senare

---

## AI-driver-ekosystemet

Det som gör karriären levande: en pool av ~130–150 namngivna AI-förare med egna karriärer som utvecklas parallellt med din. Denna sektion dokumenterar hur de skapas, utvecklas och går vidare. Din karriär sker inuti detta ekosystem.

### Generering vid karriärstart

Vid ny karriär batch-genererar en LLM hela initialpoolen:
- Namn och nationalitet (spridd global distribution, vikt mot motorsport-starka länder)
- Ålder anpassad till liga-tier (yngre längre ner i stegen, typ 16–25; äldre i topp-tiers, typ 22–38)
- Personlighet — samma 8-stats-system som användaren
- Kort bakgrundsbiografi (1–2 meningar) som används av event-LLM senare

Fördelning för en karriär i en disciplin:
- ~20 förare per liga × 4–6 ligor i stegen = 80–120 aktiva
- + 20–30 free agents (mellan kontrakt, tillgängliga för rekrytering)
- Summa: ~130–150 förare totalt

### Samma stats som användaren

Varje AI-förare har samma 8 stats-dimensioner som användaren: `pace`, `racecraft`, `consistency`, `wet_weather`, `qualifying`, `composure`, `media_savvy`, `risk_tolerance` (0–100-skala).

### Åldrande och form-kurva

Stats förändras över tid enligt en ålders-baserad default-kurva (enskilda förare kan avvika något baserat på personlighet):

- **17–22:** tillväxt (+0.5 per säsong i relevanta stats)
- **23–32:** peak (stabilt, små slumpmässiga rörelser)
- **33–40:** gradvis nedgång (−0.3 per säsong)
- **41+:** kraftigare nedgång (−1 per säsong)

Events (fas 2) kan temporärt eller permanent modifiera stats utöver ålder.

### Performance-beräkning — två lägen

**I dina races (som du själv kör i iRacing):**
- AI-förarnas faktiska placeringar läses ur race-screenshot (LLM parsar hela resultattavlan)
- Deras stats uppdateras mot observerade resultat — form-boost för över­presterare, form-minus för under­presterare

**I parallella ligor (du inte kör i):**
- Varje förare får per race en performance-score: `base_pace + consistency_variance + random_noise + personality_modifier`
- Sorterat → positioner
- Endast slutposition, härledd best lap, och ev. DNF sparas

Båda lägena matar samma driver-databas. Data för ligan du själv är i blir rikare.

### Kontrakt och team-rörelser

AI-förare har kontrakt på samma villkor som användaren (1–3 säsonger, valfria prestationsklausuler). Vid säsongsslut:

- Top-performers får uppgraderings-erbjudanden och rör sig uppåt i stegen
- Underpresterare droppas till lägre liga eller blir free agents
- Personlighets-match-problem kan leda till team-byte inom samma liga
- Free agents signas av team som förlorat förare

### Pensionering

En AI-förare går i pension när något av följande inträffar:
- Ålder > 45 **och** sjunkande stats i 2+ säsonger i rad
- Droppas från lägsta ligan utan nya erbjudanden
- Event triggar pensionering (fas 2 — t.ex. allvarlig skada eller personlig kris)

### Rookie-generering

När någon pensioneras fylls ekosystemet på underifrån:
- LLM genererar en ny ung förare (16–19 år) med lägre stats men tillväxtpotential
- Nya förare startar i lägsta ligans tier eller som free agents
- Generering sker mellan säsonger, inte mitt i

### Roster = grid

**Alla förare i en ligas roster är med på gridden i varje race** i MVP. 20 förare i rostern → 19 AI-motståndare i iRacing + användaren = full grid. Ingen subset-rotation, inga missade race. Förenklar championship-logik (alla har samma antal race per säsong).

Fas 2: events kan injicera occasional guest-drivers (wildcard-entries, rookie-tests) utöver fast roster.

### Bakgrundssimulering

Varje gång användaren rapporterar ett race tickas **alla andra ligor i disciplinen** fram parallellt:
- Appen simulerar nästa race i varje parallell liga enligt performance-modellen ovan
- Standings uppdateras, form-trender sparas
- Resultatet exponeras som narrativ-data ("Marcus Verhoeven vann sitt fjärde race i rad") — bas för framtida events och nyhetsflöde (fas 2)

---

## Karriärsystem

Din egen historia inuti AI-ekosystemet ovan — hur du skapar föraren, vilka ligor som finns, hur progression fungerar, och hur kontrakt/team-relationer utvecklas över tid.

### En aktiv karriär åt gången

Appen stödjer **en spelar-förare åt gången**. Du kan antingen fortsätta där du slutade eller starta om helt (den gamla karriären skrivs över). Flera parallella karriärer / save-slots är inte en MVP-feature och utvärderas senare om behov uppstår.

### Racing-stegen

Vid karriärstart väljer du en **disciplin**. Varje disciplin har en stege med 4–6 tiers från nybörjare till topp. Liga-namnen är **LLM-genererade vid karriärstart** — fiktiva-men-plausibla (t.ex. "Atlantic GT4 Championship", "Global Formula Regional"), konsekventa inom den karriären. Innehåll i varje tier matchar iRacings road-content.

**GT / Sports Car-stege** (5 tiers)
1. **Tier 5 — Club Racing:** gratis-bilar (MX-5 Cup, GR86). Korta sprintraces.
2. **Tier 4 — GT4-nivå:** iRacings GT4-bilar. Nationella banor.
3. **Tier 3 — GT3 Pro-Am:** GT3 Cup. Europeiska/amerikanska banor.
4. **Tier 2 — GT3 Pro / Endurance:** elitklass GT3 + LMP2-sprint.
5. **Tier 1 — Hypercar-toppen:** Hypercar + LMP2 multi-class endurance.

**Formula-stege** (6 tiers)
1. **Tier 6 — Formula Vee-nivå:** gratis-klassen. Korta race.
2. **Tier 5 — FR 2.0-nivå:** regional.
3. **Tier 4 — FIA F4-ekvivalent.**
4. **Tier 3 — FIA F3-ekvivalent.**
5. **Tier 2 — FIA F2-ekvivalent.**
6. **Tier 1 — Open-wheel-toppen** (F1/IndyCar-ekvivalent).

**Touring-stege** (4 tiers)
1. **Tier 4 — TCR Amateur.**
2. **Tier 3 — TCR Pro-Am.**
3. **Tier 2 — World Touring-nivå.**
4. **Tier 1 — Supersport-toppen** (Supercars/DTM-inspirerat).

### Multi-class racing

Tier 1 GT/Sports Car är multi-class (Hypercar + LMP2 på banan samtidigt, som i WEC). Regler:

- **Standings visas dubbelt:** overall-position (alla bilar) *och* class-position (din klass). Båda sparas i DB.
- **Championship-poäng baseras på class-position.** Du konkurrerar mot andra i din klass, inte mot LMP2:orna som råkar vara snabbare/långsammare i overall.
- **Screenshot-parsning** extraherar båda positionerna när race är multi-class (LLM informeras via prompten att det är multi-class och förväntas returnera `class` + `class_position`).
- Ligor i andra tiers är single-class → `class_position = position`, `class = car-klassen`.

### Åldersregler

- **Karriärstart:** 16–100 år. Ingen övre gräns.
- **Ingen tvingad pension** — karriären pågår så länge du och teamen vill.
- **Minimiålder per tier:**
  - Tier 5–4: 14 år
  - Tier 3: 16 år
  - Tier 2: 17 år
  - Tier 1: 18 år
- **Undantag via event (fas 2):** om du har toppresultat i tier 2 men är 17, kan ett team lobba för undantag (Verstappen-stil).

### Förarpersonlighet och stats

Vid karriärstart sätter du förarpersonlighet via hybrid-flöde:
1. Svara på ~8 narrativa frågor
2. Appen fördelar stats baserat på svar
3. Finjustera manuellt med point-buy

Stats-dimensioner (0–100):
- `pace` — ren hastighet
- `racecraft` — närkamp, överge/försvar
- `consistency` — varians mellan race
- `wet_weather` — regn-bonus
- `qualifying` — enkla varv under press
- `composure` — mental stabilitet under press
- `media_savvy` — press/sponsor-hantering
- `risk_tolerance` — aggressivt kontra defensivt

Stats används för:
- **Team-fit:** missmatch mellan personlighet och team-kultur → lägre team_trust över tid
- **Erbjudande-profil:** aggressiva förare lockar team som vill ha fighters; strategiska förare lockar strategi-team
- **Event-reaktioner (fas 2):** LLM använder personligheten som kontext när events genereras och tolkas
- **Ingen direkt påverkan på rapporterade resultat** — användarens input är sanning (designprincip)

### Progression

Varje säsong i en liga har 6–14 races (varierar per tier). Slutposition avgör din fate:

- **Promoted** (topp X%) — erbjudanden från ligan ovanför, ev. från flera team
- **Retained** (mitten) — samma liga nästa säsong, samma team eller nytt erbjudande
- **Dropped** (botten) — fall till lägre liga, eller karriär-slut om du redan är längst ner
- **Fired mid-season** — kontrakt med prestationsklausul du inte uppfyllt → mitt-i-säsongen-byte (troligen lägre team) eller karriär-pause

### Team och kontrakt

Varje säsong kör du för ett team. Team har attribut:
- `budget` — påverkar antal uppgraderingar under säsongen
- `car_performance` (0–100) — bilens grundprestanda
- `reputation` — påverkar andras uppfattning om dig
- `mechanic_skill` — påverkar tillförlitlighet (DNF-risk)
- `team_culture` — används för förar-personlighet-fit

**Kontrakt:**
- **Längd:** 1–3 säsonger. Större team tenderar att erbjuda längre kontrakt.
- **Prestationsklausul (valfri):** "avsluta topp X", "minst Y poäng". Missar du → risk för sparken mitt i säsongen.
- **Säsongsslut:** teamet erbjuder förnyelse beroende på prestation. Andra team kan också göra erbjudanden.

Högre-tier team = bättre bil = lättare att vinna. Men också större press, högre förväntningar, värre konsekvenser vid dåligt resultat.

### Championship-poäng

**Point-system genereras per liga av LLM vid karriärstart, hårt väglett av verkliga ligor som inspiration.** Varje liga får sitt eget `point_system_json` — konsekvent inom karriären, olika mellan ligor.

Prompten till LLM specificerar tier + discipline + grid-storlek och ger konkreta referensmodeller:
- **Formula Tier 1:** F1-inspirerat (25-18-15-12-10-8-6-4-2-1 för topp 10) + eventuell fastest-lap-bonus
- **GT/Sports Tier 1 (multi-class endurance):** WEC Hypercar-inspirerat (25-18-... + pole/fastest-bonus per class)
- **Touring Tier 1:** BTCC/Supercars-inspirerat (kortare skala, reverse-grid-bonus kan förekomma)
- **Mellan-tiers:** regionala serier som inspiration (Formula Regional, GT4 European, etc.)
- **Låg-tiers (Tier 4–6):** enklare skalor (topp 5 eller topp 8) typ Mazda MX-5 Cup

**JSON-format:**
```json
{
  "points_by_position": [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
  "bonuses": {
    "pole": 1,
    "fastest_lap": 1,
    "most_positions_gained": 0
  },
  "applies_to": "class_position",        // eller "overall_position" för single-class
  "inspired_by": "WEC Hypercar 2024"     // frivillig, för UX-tooltip
}
```

**Läsbarhet:** User kan när som helst öppna ligasidan och se tabellen. `inspired_by` visas som liten tooltip ("inspirerat av WEC Hypercar 2024") så user förstår var siffrorna kommer ifrån.

**Multi-class:** `applies_to: "class_position"` för Tier 1 Hypercar/LMP2 (besvarat i fråga 3).

### Teamkamrat

Varje team har 2 förare per liga — när user signar är den andra automatiskt teamkamrat.

- **Val vid signing:** user ersätter den av teamets två existerande förare som passar sämst (lägst performance eller personlighets-konflikt). Den andra blir teamkamrat. User väljer inte själv — teamet bestämmer, som i verkligheten.
- **Under säsongen:** teamkamraten är i rostern → alltid på gridden. Direct head-to-head syns i resultattavlan. Ingen särskild mekanik i MVP utöver gemensam team-tillhörighet.
- **Mellan säsonger:** normal kontrakt-cykel. Teamkamraten kan flyttas upp, sparkas, pensioneras eller stanna. Ny teamkamrat kommer in via teamets rekrytering.
- **Fas 2-events:** team orders, "teamkamraten outqualifierade dig tredje racet i rad", rivalitet, mekaniker-favorisering — hanteras som events senare.

Datamodell: teamkamrat = annan driver i samma team under samma season via `contract`-tabellen. Ingen ny tabell behövs.

---

## Dynamiska events (fas 2)

Events är vad som gör karriären levande mellan races. De är inte skriptade scenarion — de genereras dynamiskt av LLM utifrån mallar, karriärstate och användarens fritext-svar. Samma system driver events för både användaren och AI-förarna.

### Arkitektur — hybrid deterministisk + LLM

1. **Triggers är deterministiska.** Regelbaserade villkor på karriärstate bestämmer *när* ett event sker (t.ex. "efter race 3, om position < 10, 30% chans"). Slumpen ligger i reglerna, inte i LLM:en — annars riskerar vi event-spam eller event-torka.
2. **Event-mall kommer från JSON.** Abstrakt struktur som definierar situationstyp, tema, tonalitet och tillåtna effekt-dimensioner.
3. **LLM genererar situationen.** Utifrån mallen + karriärstate + senaste events skapar LLM:en den specifika händelsen i voice-guide-stil.
4. **Användaren svarar i fritext.** "Jag ringer teamchefen privat och försäkrar honom…"
5. **LLM beslutar utfall.** Anropet får: mallens tillåtna effekt-dimensioner + situationen + användarens svar + karriärstate. Returnerar strukturerad JSON.

### Event-mall (abstrakt JSON)

```json
{
  "template_id": "internal_rivalry",
  "category": "relationship",
  "trigger": {
    "condition": "teammate_pace_gap < 0.3% over last 3 races",
    "min_race_in_season": 4,
    "cooldown_races": 6
  },
  "tier_range": [1, 10],
  "themes": ["teammate_rivalry", "first_driver_status", "team_politics"],
  "effect_dimensions": ["reputation", "team_trust", "teammate_relationship", "morale"],
  "tone": "tense but professional",
  "stakes_hint": "Hur föraren hanterar intern press avgör team-dynamik resten av säsongen",
  "chain_allowed": true
}
```

Mallen styr **när, varför och vad som står på spel**. LLM:en hittar på **vem, hur och exakt utfall** inom de ramarna.

### Effekt-kategorier (LLM:ens action space)

LLM:ens utfall-JSON måste ligga inom denna lista:

- `reputation_delta` — hur sporten ser dig
- `team_trust_delta` — ditt nuvarande teams förtroende
- `teammate_relationship_delta` — relation till teamkamrat
- `sponsor_risk` — `reduced` / `unchanged` / `elevated` / `pulled`
- `sponsor_interest_delta` — dragkraft för nya sponsorer
- `contract_risk_delta` — risk att få sparken (0–100)
- `morale_delta` — mental status, påverkar prestanda om låg
- `fan_count_delta` — absolut antal
- `fan_devotion_delta` — 0–100, hur lojala
- `grid_penalty_next_race` — tvingad grid-straff
- `practice_modifier` — missar session / extra träning
- `injury_status` — `null` / `minor` / `major`
- `media_heat` — pågående narrativ-tråd LLM:en refererar till senare
- `championship_standing_impact` — extra/minus-poäng direkt i standings
- `rival_relationship_delta` — påverkar specifika AI-förar-relationer
- `family_life_status` — bakgrunds-status som kan trigga framtida events och modifiera morale

Plus alltid: `outcome_narrative` (text), `notes_for_future` (continuity-feed), och vid chain-events: `next_step_trigger` (om eventet fortsätter).

### Event-flöde

1. Trigger firar på bakgrundstick (mellan races eller under race-weekend)
2. Appen visar genererad situation
3. Användaren svarar i fritext (eller missar = defaultval)
4. LLM returnerar utfall-JSON
5. Effekter appliceras på karriärstate; notes sparas för continuity
6. Om `next_step_trigger` finns: eventet hamnar i aktiv chain-lista

### Single-step vs multi-step events

**Single-step:** situation → svar → utfall = klart. Klassisk singel-händelse.

**Multi-step (chain):** ett event sträcker sig över 2–4 race-weekends. Första steget sätter en tråd; nästa step triggas vid nästa race-milestone och refererar tillbaka till dina tidigare val. Exempel-tråd:
- *Weekend 1:* sponsor flaggar oro efter incident — du lovar ligga lågt i media
- *Weekend 2:* journalist pressar dig på presskonferens — hur svarar du?
- *Weekend 3:* sponsor-beslut: stanna, minska, eller hoppa av

Max 3 aktiva chains samtidigt för att inte överväldiga. Varje chain har eget `chain_id` och lagras med full historik för kontext.

### Events för AI-förare

Samma event-system tickar även över AI-rostern. När ett event triggar på en AI-förare:
- LLM genererar situationen + utfallet direkt (ingen användar-input)
- Utfallet uppdaterar den AI-förarens state (stats, team_trust hos deras team, etc.)
- Händelsen loggas som `news_item` i nyhetsflödet
- Trigger-frekvens på AI lägre än användaren: ~1 event per 5 races per förare

### Nyhetsflöde och favoritmarkering

Alla events (dina + AI-förarnas) loggas som `news_item`-rader. UI visar:
- **Paddock News** — generell lista över senaste händelser i hela disciplinen
- **Ditt flöde** — dina egna events + events som rör favoritmarkerade förare + events som direkt påverkar dig (team, liga, rivaler)

Användaren kan favoritmarkera vilken AI-förare som helst. Favoriter får prioriterad plats i flödet.

### Personliga rivaler

Över tid kan specifika AI-förare bli dina återkommande rivaler. Rivalitet triggas automatiskt av:
- Konsekvent närliggande resultat över flera säsonger
- Vissa events (incident mellan er på banan, citat i media)
- Team-byten (din före detta teamkamrat går till konkurrent)

Rivalitet är ett långvarigt chain-event-tillstånd som påverkar event-sannolikhet och tonalitet (din rivals events refererar dig; dina refererar dem). Rivalitet kan avta (glöms efter 2 säsonger utan triggers) eller eskalera (förnyas av nya incidents).

### Event-frekvens

- **För användaren:** ~1 event per 2 races i genomsnitt → 4–7 events per säsong. Fördelas av triggers; inga två i rad.
- **För AI-rostern:** ~1 event per 5 races per förare, fördelat. Vid 130 förare innebär det 20–30 AI-events per race-weekend globalt. Alla hamnar i Paddock News; användaren ser bara ett urval baserat på favoriter + relevans.

### Voice guide (draft — editera)

> **Språk:** Svenska.
>
> **Ton:** Torr, journalistisk, aldrig melodramatisk. Som en sportkrönikör för Guardian Sport eller Autosport i svensk översättning.
>
> **Undvik:** Utropstecken, klichéer ("gasade på!", "otrolig pilot"), övertydlig känslo-målning, direkt tilltal till läsaren.
>
> **OK:** Torra observationer, tekniska termer utan förklaring, halvcyniska analyser, branschjargong.
>
> **Struktur:** Kort. Ett event-narrativ är 2–4 meningar, inte fyra stycken. Lämna utrymme åt läsarens fantasi.
>
> **Karaktärsnamn:** Konsekvent. "Patrik Lindström" får inte senare bli "Patrick" eller "P. Lindström".
>
> **Exempel på ton:**
> - *Bra:* "Teamchefen hör av sig klockan 23:14 en söndag. Det är sällan ett gott tecken."
> - *Dåligt:* "Du kan knappt tro det du hör när teamchefen ringer! En otrolig möjlighet har just uppenbarat sig!"

### Designregel

Varje event ska kännas **plausibelt**. Inga lotterier, inga utomjordingar. Om en sim-racer läser eventet ska hen tänka *"det där har jag hört talas om i verkligheten"*.

### Datamodell (detaljeras i Teknisk arkitektur)

- `event_template` — JSON-mallarna, laddade från `data/events/`
- `event_instance` — faktiska körda events (mall-id, driver_id, state, narrativ, användarsvar, utfall, chain_id)
- `news_item` — post i nyhetsflödet (event_instance_id, driver_id, date, visibility)
- `rivalry` — långvariga rivalitets-trådar (driver_a_id, driver_b_id, intensity, last_trigger_date)
- `favorite_driver` — användarens favoriter (driver_id)
- `active_chain` — pågående multi-step-events (chain_id, current_step, next_trigger_condition)

---

## Resultatrapportering (MVP-kärna)

Varje race-weekend rapporteras i sessions i **strikt ordning**: (practice →) qualifying → race. **Practice är valfritt**, quali + race är obligatoriska. Nästa race kan inte påbörjas förrän föregående weekend är klarrapporterad. LLM parsar både användarens och alla AI-förares placeringar så att ekosystemet uppdateras korrekt.

### Flöde per weekend

**1. Practice-rapportering (valfritt)**
- Skippa helt, eller släpp in screenshot från practice-session (iRacings Results-vy)
- Parsas: användarens bästa varvtid, antal laps, notes (röda flaggor, spinns, incidents om synliga)
- AI-förares tider noteras *om synliga* — inte krav
- Skippad practice sparas som `session_result.status = 'skipped'` — narrativ hook för fas 2 (events kan referera "hoppade över practice")

**2. Qualifying-rapportering (krav)**
- Screenshot från qualifying-results
- Parsas: användarens position + varvtid, **alla AI-förares positioner + varvtider**, DNFs

**3. Race-rapportering (krav)**
- **Race Results-sidan** efter racet
- Parsas: användarens position, total_drivers, best_lap_ms, total_time_ms, gap_to_leader_ms, DNF, penalties, incidents, **alla AI-förares slutpositioner + best laps + ev. DNF**
- Multi-screenshot stöds: användaren kan släppa in flera bilder om resultaten är spridda över flera sidor, eller om de vill inkludera incident-screenshots (se nedan)

### Krav per session

- **Ingen rapportering accepteras out-of-order** — practice kan skippas eller rapporteras *innan* quali; kan inte rapporteras i efterhand efter att quali är klar
- **Strikt "rapportera innan nästa race"** — appen låter dig inte sätta upp nästa race förrän föregående weekend är klar

### Multi-screenshot-support

Användaren kan släppa in **flera bilder per session**:
- **Huvudkrav för race:** Race Results-sidan med alla positioner (ofta en bild räcker, men vissa layouter kräver scrollning → flera bilder)
- **Valfritt:** incident-screenshots (t.ex. du kraschar med en specifik förare). LLM extraherar inblandade förare och typ av incident; sparas som `incident_record` kopplat till race-instansen. Dessa används **inte direkt** i MVP men utgör grund för fas 2 — rivaler kan triggas av återkommande incidents med samma förare.

### LLM-parsning

- **Modell:** Claude Sonnet 4.6 (se [LLM-modellval per feature](#llm-modellval-per-feature))
- **Prompt:** strukturerad, returnerar Zod-validerad JSON
- **Osäkerhetshantering:** om LLM:en är osäker på något fält eller på namnmatchning → returnerar `uncertain_fields` i sitt svar. Appen visar en **clarification-modal** där användaren svarar; användarens svar blir sanning.
- **Ingen lokal OCR-fallback.** Claude vision är enda parsnings-vägen. Motivering: tesseract extraherar text men inte struktur (multi-class-färger, kolumnlayouter, ikoner kräver custom parsers per UI-version — underhållsskuld som bryts när iRacings UI ändras). Accuracy-skillnaden skulle leda till fler clarification-modaler, vilket är värre UX än marginalkostnaden. Kostnadskontroll hanteras via prompt caching + sharp-komprimering + mjuk månadsbudget.

### Namnmatchning mot roster

Parsade namn mappas mot den aktiva rostern:
- **Exakt match** — automatiskt
- **Nästan-match** (OCR-typ: "Verhoven" vs "Verhoeven", eller "M. Verhoeven" vs "Marcus Verhoeven") — LLM föreslår matchning, appen visar den i modal för bekräftelse
- **Ingen match** — modal ber användaren välja rätt driver från rostern eller markera som "okänd" (loggas men påverkar inte stats)

### DNF-hantering

Om användarens resultat är DNF:
- Appen öppnar fritext-fält **"Vad hände?"** — användaren skriver egen beskrivning ("motorhaveri på varv 12" / "kolliderade med P4 i första varvet")
- Sparas som en del av race-resultatet och matas in i karriärhistoriken
- Används senare av event-LLM för continuity och kan trigga events (skyll ifrån dig / ta på dig ansvaret / acceptera tekniskt fel)

### Prompt-template (skiss — race-session)

```
Du får en eller flera screenshots från en iRacing Race Results-sida.
Användaren körde som "{driver_name}". Den aktiva rostern för detta
race innehåller följande förare: {roster_names}.

Extrahera följande och returnera som JSON:
{
  "user_result": {
    "position": <int>,
    "total_drivers": <int>,
    "best_lap_ms": <int or null>,
    "total_time_ms": <int or null>,
    "gap_to_leader_ms": <int or null>,
    "dnf": <bool>,
    "penalties": [<string>],
    "incidents": <int>,
    "notes": <string>
  },
  "ai_results": [
    {
      "name_raw": <string, exakt som i screenshot>,
      "name_matched": <string, närmsta match i roster, eller null>,
      "match_confidence": "exact" | "high" | "low" | "none",
      "position": <int>,
      "best_lap_ms": <int or null>,
      "dnf": <bool>
    }
  ],
  "uncertain_fields": [<string paths i JSON:en>]
}

Om något inte går att utläsa, använd null och lägg fältet i uncertain_fields.
Gissa inte.
```

### Redigering av sparade resultat

Sparade resultat är fritt redigerbara i MVP. User kan öppna ett race och ändra position, tider, DNF-flagga, anteckningar. Single-player-app utan championship-integritet att skydda — ingen loggning eller "editerat"-markör i MVP.

**Fas 2-komplikation:** om ett event triggats från ett race-resultat kan redigering bryta event-state. Beslut om låsning efter event-trigger eller regenerering skjuts till fas 2.

### Dubbelrapportering-skydd

När user försöker rapportera ett race som redan har en race-session för user-driver: modal dyker upp — *"Detta race är redan rapporterat med P3. Vill du **redigera befintligt resultat** eller **avbryta**?"* Ingen hard block. "Redigera befintligt" återanvänder redigerings-flödet ovan; "Avbryta" sparar inget. Skyddar mot oavsiktlig överskrivning utan att blockera medvetna rättelser.

Duplicate-file i upload-widget (samma fil dras in två gånger) hanteras separat av UI:t, inte av data-logiken.

### Spara mycket, använd senare

Filosofin är att **notera så mycket som möjligt** ur screenshots — även saker som inte används i MVP. Incidents, anteckningar, temperaturer, banförhållanden, penalty-orsaker — allt sparas om det är synligt. Event-LLM i fas 2 kan hämta denna data för att generera specifika, situationella events.

### Framtid: multi-user

Nuvarande MVP är byggt för en enskild användare (du själv) med egen Claude-nyckel. På sikt kan appen öppnas för att **vem som helst ska kunna logga in med sitt eget Claude-konto** och använda appen — arkitekturen stöder det redan (keychain-lagring per installation, ingen delad backend).

---

## Teknisk arkitektur

### Stack

- **Ramverk:** Electron (main-process i Node.js, renderer i Chromium)
  - *Varför:* hela stacken i TypeScript, stort ekosystem, prestanda är mer än tillräcklig för en databas-driven karriär-app (inga realtidskrav)
  - *Accepterad kostnad:* ~150 MB binär, ~200 MB RAM idle
- **Språk:** TypeScript överallt (både main och renderer)
- **Frontend (renderer):**
  - React + Vite (snabb HMR) + Tailwind + shadcn/ui
- **Backend (main-process):**
  - `better-sqlite3` för SQLite (synkron, snabb, standard i Electron)
  - `@anthropic-ai/sdk` (officiell Node-SDK) för Claude API med prompt caching
  - `keytar` för säker lagring av iRacing-credentials (OS keychain)
  - `sharp` för bild-preprocessing (downsizing/kompression före LLM-anrop)
  - Egen iRacing Data API-klient (fetch + cookie-auth mot `members-ng.iracing.com`)
  - `zod` för validering av IPC-payloads och LLM-JSON-svar
- **IPC:** `contextBridge` med typed wrappers — renderer får full autocomplete via en delad TS-typfil. *Ingen Express/HTTP-server på localhost* — IPC är snabbare, säkrare och mindre boilerplate.
- **Databas:** SQLite-fil i användarens app-data-mapp (via `app.getPath('userData')`)
  - macOS: `~/Library/Application Support/sim_career/career.db`
  - Linux: `~/.config/sim_career/career.db`
  - Windows: `%APPDATA%\sim_career\career.db`
- **Paketering:** `electron-builder` bundlar `.dmg` (Mac), `.exe`/`.msi` (Win), `.AppImage`/`.deb` (Linux)

### LLM-modellval per feature

Defaults centraliseras i en `ModelConfig`-const så modellbyte är en rad kod, inte en refaktor. Prompt caching aktiveras överallt där det är meningsfullt (karriärkontext, roster, liga-specs).

| Feature | Modell | Motiv |
|---|---|---|
| Screenshot-parsning (vision → JSON) | `claude-sonnet-4-6` | Händer efter varje session; accuracy kritisk; kostnadsrimlig |
| Liga-namngenerering vid karriärstart | `claude-sonnet-4-6` | En gång per karriär; kvalitet räknas |
| AI-driver-generering (namn + bakgrund) | `claude-haiku-4-5` | ~130 förare vid start, kort text per — volym-känsligt |
| Event-generering för spelaren (fas 2) | `claude-opus-4-7` | Få per vecka; narrative quality = hela feature-känslan |
| AI-driver-events bakgrund (fas 2) | `claude-haiku-4-5` | Hög volym, bakgrundsnarrativ |

Byte tillåts när empirisk data (fel-rate, kostnad) motiverar.

### API-kostnadshantering

Claude API kostar pengar per anrop. För transparens och kontroll:

- **Usage-logg.** Varje Anthropic-anrop loggas i `api_usage_log` (model, input_tokens, output_tokens, cost_usd, operation, timestamp). Kostnad beräknas via `PRICING_MAP`-konstant (aktuella priser per modell; lätt att uppdatera).
- **Statusbar.** Huvudskärmens statusbar visar "denna månad: $X.XX" (aggregat från usage-logg).
- **Mjuk månadsbudget.** Settings-panel låter user sätta valfri månadsbudget. Varning vid 80% och 100% via banner; **inga anrop blockeras**. Filosofin: transparens + agency, ingen app som hittar på egna beslut och stumnar mitt i ett event.
- **Settings-vy.** Breakdown per operation (screenshot-parsning, AI-events, etc.) så user förstår var kostnaden uppstår.

### Databas-schema

Alla tabeller ligger i samma SQLite-fil per installation. Endast en karriär är aktiv åt gången (se [En aktiv karriär åt gången](#en-aktiv-karriär-åt-gången)); om user startar om skrivs den gamla över. Schemat nedan är MVP-fokuserat men inkluderar event-tabeller som behövs först i fas 2.

```sql
-- ============ CORE ============

CREATE TABLE career (
  id INTEGER PRIMARY KEY,
  created_at DATETIME NOT NULL,
  discipline TEXT NOT NULL,            -- 'gt' | 'formula' | 'touring'
  user_driver_id INTEGER REFERENCES driver(id),
  current_date DATE NOT NULL,          -- in-game datum, tickar fram
  active INTEGER DEFAULT 1,
  settings_json TEXT                   -- voice guide overrides, event freq, etc
);

-- ============ iRacing CONTENT ============

CREATE TABLE car (
  id INTEGER PRIMARY KEY,
  iracing_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,                 -- 'GT3' | 'GT4' | 'F3' | ...
  category TEXT NOT NULL               -- 'sports_car' | 'formula'
);

CREATE TABLE track (
  id INTEGER PRIMARY KEY,
  iracing_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  layout TEXT,                         -- 'Grand Prix' | 'Club' | ...
  category TEXT NOT NULL               -- 'road' (MVP)
);

CREATE TABLE car_ownership (
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  car_id INTEGER REFERENCES car(id),
  PRIMARY KEY (career_id, car_id)
);

CREATE TABLE track_ownership (
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  track_id INTEGER REFERENCES track(id),
  PRIMARY KEY (career_id, track_id)
);

-- ============ DRIVERS (unified user + AI) ============

CREATE TABLE driver (
  id INTEGER PRIMARY KEY,
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  is_user INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  nationality TEXT,                    -- ISO country code
  birth_date DATE NOT NULL,            -- ålder beräknas mot career.current_date
  bio TEXT,                            -- 1-2 meningar, LLM-genererad för AI

  -- Aktuella stats (0-100)
  pace INTEGER NOT NULL,
  racecraft INTEGER NOT NULL,
  consistency INTEGER NOT NULL,
  wet_weather INTEGER NOT NULL,
  qualifying INTEGER NOT NULL,
  composure INTEGER NOT NULL,
  media_savvy INTEGER NOT NULL,
  risk_tolerance INTEGER NOT NULL,

  form_modifier REAL DEFAULT 0,        -- kortsiktig form (-5 till +5)
  status TEXT NOT NULL,                -- 'active' | 'free_agent' | 'retired'
  retired_at DATE,

  -- Karriär-metrics
  reputation INTEGER DEFAULT 50,
  morale INTEGER DEFAULT 50,
  fan_count INTEGER DEFAULT 0,
  fan_devotion INTEGER DEFAULT 50
);

CREATE INDEX idx_driver_career ON driver(career_id);
CREATE INDEX idx_driver_status ON driver(status);

CREATE TABLE driver_stats_snapshot (
  id INTEGER PRIMARY KEY,
  driver_id INTEGER REFERENCES driver(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  taken_at DATE NOT NULL,

  pace INTEGER, racecraft INTEGER, consistency INTEGER, wet_weather INTEGER,
  qualifying INTEGER, composure INTEGER, media_savvy INTEGER, risk_tolerance INTEGER,

  reputation INTEGER, morale INTEGER, fan_count INTEGER, fan_devotion INTEGER
);

CREATE INDEX idx_snapshot_driver ON driver_stats_snapshot(driver_id);

-- ============ SERIES, SEASONS, TEAMS, CONTRACTS ============

CREATE TABLE series (
  id INTEGER PRIMARY KEY,
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                  -- LLM-genererad vid karriärstart
  tier INTEGER NOT NULL,               -- 1 = toppen
  discipline TEXT NOT NULL,
  num_races_per_season INTEGER NOT NULL,
  point_system_json TEXT NOT NULL,     -- LLM-genererad, verkliga ligor som inspiration (se Karriärsystem → Championship-poäng)
  active INTEGER DEFAULT 1
);

CREATE TABLE team (
  id INTEGER PRIMARY KEY,
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  series_id INTEGER REFERENCES series(id),
  name TEXT NOT NULL,
  budget INTEGER,
  car_performance INTEGER,             -- 0-100
  reputation INTEGER,
  mechanic_skill INTEGER,
  team_culture TEXT                    -- 'aggressive' | 'strategic' | 'family' | ...
);

CREATE TABLE season (
  id INTEGER PRIMARY KEY,
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  series_id INTEGER REFERENCES series(id),
  season_number INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT                          -- 'upcoming' | 'active' | 'completed'
);

CREATE TABLE contract (
  id INTEGER PRIMARY KEY,
  driver_id INTEGER REFERENCES driver(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES team(id),
  start_season INTEGER NOT NULL,
  length_seasons INTEGER NOT NULL,
  performance_clause_json TEXT,        -- { top_x: 5, min_points: 100 } eller null
  status TEXT NOT NULL                 -- 'active' | 'completed' | 'terminated'
);

-- ============ RACES OCH SESSIONS ============

CREATE TABLE race (
  id INTEGER PRIMARY KEY,
  season_id INTEGER REFERENCES season(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  track_id INTEGER REFERENCES track(id),
  car_class_required TEXT,
  date DATE NOT NULL,
  status TEXT NOT NULL,                -- 'scheduled' | 'completed' | 'missed'
  recommended_setup_json TEXT          -- längd, väder, AI-svårighet, etc
);

CREATE TABLE session_result (
  id INTEGER PRIMARY KEY,
  race_id INTEGER REFERENCES race(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,          -- 'practice' | 'qualifying' | 'race'
  status TEXT NOT NULL DEFAULT 'reported', -- 'reported' | 'skipped' (practice kan skippas)
  driver_id INTEGER REFERENCES driver(id),
  position INTEGER,                    -- overall position
  class TEXT,                          -- t.ex. 'Hypercar' | 'LMP2' | NULL om single-class
  class_position INTEGER,              -- position inom class; = position i single-class
  total_drivers INTEGER,
  best_lap_ms INTEGER,
  total_time_ms INTEGER,
  gap_to_leader_ms INTEGER,
  dnf INTEGER DEFAULT 0,
  dnf_description TEXT,                -- användarens fritext vid DNF
  penalties_json TEXT,
  incidents_count INTEGER,
  notes TEXT,
  screenshot_paths_json TEXT,          -- lista av sparade paths
  recorded_at DATETIME NOT NULL
);

CREATE INDEX idx_session_race ON session_result(race_id);
CREATE INDEX idx_session_driver ON session_result(driver_id);

CREATE TABLE incident_record (
  id INTEGER PRIMARY KEY,
  race_id INTEGER REFERENCES race(id) ON DELETE CASCADE,
  driver_a_id INTEGER REFERENCES driver(id),
  driver_b_id INTEGER REFERENCES driver(id),
  incident_type TEXT,                  -- 'contact' | 'off_track' | 'pit_mistake'
  lap INTEGER,
  description TEXT,
  screenshot_path TEXT
);

-- ============ ROSTER (iRacing-sync) ============

CREATE TABLE roster (
  id INTEGER PRIMARY KEY,
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  series_id INTEGER REFERENCES series(id),
  name TEXT NOT NULL,
  iracing_roster_file_path TEXT,
  last_synced_at DATETIME
);

CREATE TABLE roster_driver (
  roster_id INTEGER REFERENCES roster(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES driver(id),
  iracing_ai_skill INTEGER,            -- härleds från pace+consistency
  iracing_ai_aggression INTEGER,       -- härleds från risk_tolerance
  PRIMARY KEY (roster_id, driver_id)
);

-- ============ EVENTS (fas 2) ============

CREATE TABLE event_template (
  template_id TEXT PRIMARY KEY,        -- laddas från data/events/*.json
  category TEXT,
  tier_range_json TEXT,
  themes_json TEXT,
  effect_dimensions_json TEXT,
  tone TEXT,
  stakes_hint TEXT,
  chain_allowed INTEGER
);

CREATE TABLE event_instance (
  id INTEGER PRIMARY KEY,
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES event_template(template_id),
  driver_id INTEGER REFERENCES driver(id),
  state TEXT NOT NULL,                 -- 'awaiting_response' | 'resolved' | 'skipped'
  narrative TEXT,                      -- LLM-genererad situation
  user_response TEXT,                  -- fritext (null för AI-events)
  outcome_json TEXT,                   -- strukturerat utfall från LLM
  notes_for_future TEXT,               -- continuity-fältet
  chain_id TEXT,                       -- grupperar multi-step events
  parent_event_id INTEGER REFERENCES event_instance(id),
  created_at DATETIME NOT NULL,
  resolved_at DATETIME
);

CREATE INDEX idx_event_career ON event_instance(career_id);
CREATE INDEX idx_event_driver ON event_instance(driver_id);
CREATE INDEX idx_event_chain ON event_instance(chain_id);

CREATE TABLE news_item (
  id INTEGER PRIMARY KEY,
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  event_instance_id INTEGER REFERENCES event_instance(id),
  driver_id INTEGER REFERENCES driver(id),
  date DATE NOT NULL,
  visibility TEXT NOT NULL             -- 'paddock' | 'user_feed' | 'both'
);

CREATE TABLE rivalry (
  id INTEGER PRIMARY KEY,
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  driver_a_id INTEGER REFERENCES driver(id),
  driver_b_id INTEGER REFERENCES driver(id),
  intensity INTEGER,                   -- 0-100
  last_trigger_date DATE,
  started_at DATE
);

CREATE TABLE favorite_driver (
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES driver(id),
  PRIMARY KEY (career_id, driver_id)
);

CREATE TABLE active_chain (
  chain_id TEXT PRIMARY KEY,
  career_id INTEGER REFERENCES career(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL,
  next_trigger_condition_json TEXT,
  last_event_instance_id INTEGER REFERENCES event_instance(id)
);

-- ============ API-USAGE (kostnadstransparens) ============

CREATE TABLE api_usage_log (
  id INTEGER PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  model TEXT NOT NULL,                 -- 'claude-sonnet-4-6' etc.
  operation TEXT NOT NULL,             -- 'screenshot_parse' | 'ai_generation' | 'event' | etc.
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cache_read_tokens INTEGER DEFAULT 0,
  cache_write_tokens INTEGER DEFAULT 0,
  cost_usd REAL NOT NULL
);

CREATE INDEX idx_api_usage_timestamp ON api_usage_log(timestamp);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- t.ex. 'monthly_budget_usd' = '10.00'
```

### Katalogstruktur (förslag)

```
sim_career/
├── src/
│   ├── main/                   # Electron main-process (Node.js)
│   │   ├── index.ts            # app lifecycle, window creation
│   │   ├── ipc/                # IPC handlers
│   │   ├── db/                 # better-sqlite3 queries + migrations
│   │   ├── ai/                 # Claude API-klient + prompt-templates
│   │   ├── iracing/            # iRacing Data API-klient + roster-sync
│   │   ├── roster/             # roster-generering + pool-simulation
│   │   ├── career/             # karriär-logik (progression, kontrakt)
│   │   └── events/             # event-engine (triggers, LLM-dialog, chains)
│   ├── preload/
│   │   └── index.ts            # contextBridge — exponerar typed API
│   ├── renderer/               # React frontend
│   │   ├── components/
│   │   ├── pages/
│   │   └── stores/
│   └── shared/
│       └── types.ts            # delade TS-typer (IPC-kontrakt, modeller)
├── data/
│   └── events/                 # JSON-mallar för events
├── electron-builder.yml
├── vite.config.ts
├── tsconfig.json
├── package.json
└── SPEC.md
```

---

## Roadmap

### Fas 1 — MVP (en komplett karriär utan events)

- [ ] **Steg 0:** teknisk spike — verifiera iRacings roster-sync-möjligheter (API eller fil-export)
- [ ] Electron-projekt-scaffold (main + preload + renderer), Vite + React
- [ ] `better-sqlite3`-schema + migrations (alla tabeller utom event-relaterade)
- [ ] Typed IPC-kontrakt (shared/types.ts + contextBridge)
- [ ] iRacing API-klient: login, content-katalog, content-ägande
- [ ] `keytar`-flöde för iRacing-credentials
- [ ] Karriär-skapande-UI: disciplin, förare, personlighet-hybrid-flöde (8 frågor + point-buy)
- [ ] LLM-batch-generering av AI-roster vid karriärstart (130–150 förare)
- [ ] Roster-export/sync till iRacing (metod enligt spike-resultat)
- [ ] LLM-generering av ligor + team + kontrakt vid karriärstart
- [ ] In-game kalender med datum-tickning mellan race
- [ ] Pre-race briefing-UI med rekommenderad iRacing-setup
- [ ] Screenshot-rapportering: practice → qualifying → race med multi-screenshot-stöd
- [ ] Clarification-modal för osäkra fält + roster-namnmatchning
- [ ] Bakgrundssimulering av parallella ligor
- [ ] Standings-vy (liga + förare-form över tid)
- [ ] Avsluta-säsong-flöde: promotion/relegation, kontraktsförhandlingar, roster-rörelser, pensioneringar, nya rookies

### Fas 2 — Events och narrativ

- [ ] Event-engine: deterministiska triggers, JSON-mallar, LLM-dialog, Zod-validering
- [ ] 15–25 initiala event-mallar i `data/events/`
- [ ] Single-step + multi-step (chains, max 3 aktiva)
- [ ] Events på AI-förare (bakgrundsevents)
- [ ] Nyhetsflöde: Paddock News + personligt flöde
- [ ] Favoritmarkering av AI-förare
- [ ] Personliga rivaler som långvariga trådar
- [ ] Voice-guide implementerad i systemprompt
- [ ] Age-gate-undantag via event (Verstappen-stil)
- [ ] Practice-goal-event: pre-race-trigger sätter mål (däckslitage, konsistens, bansinlärning); utvärdering via användarens rapport/screenshot; effekt på reputation/morale/fan_count

### Fas 3 — Utbyggnad

- [ ] Sponsorsystem (storlek, lojalitet, avhopp, budget-påverkan)
- [ ] Dynamiska ligor — serier kan läggas ner, nya startas, klass-regler ändras
- [ ] Multi-class-experiment (Hypercar + LMP2 + GT3 samtidigt)
- [ ] Fler discipliner per installation (om behov uppstår)

### Fas 4 — Polish & delning

- [ ] Karriär-export (dela din story som markdown)
- [ ] Statistik-dashboard (career metrics över tid)
- [ ] Auto-import av race-resultat via iRacing API (för online/hosted races)
- [ ] Cloud-sync
- [ ] Multi-user — vem som helst loggar in med sitt eget Claude-konto

---

## Nästa steg

1. Skissa på UI-flödet (wireframe) för de 3 MVP-huvudskärmarna: karriär-översikt, kalender, resultat-import
2. Teknisk spike (steg 0 i MVP): verifiera iRacing roster-sync Alternativ B
3. Scaffolda Electron-projektet (main + preload + renderer) och commit:a
4. Sätt upp SQLite-schema + första migration
