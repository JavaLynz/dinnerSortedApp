# Kravdokument – Dinner Sorted
**Examensarbete | Java-backend & AI-integration**  
**Version:** 1.0  
**Datum:** 2026-04-22  
**Författare:** Lynsey Fox

---

## 1. Projektöversikt

Dinner Sorted är en webbaserad måltidsplanerare där användaren anger vilka ingredienser de har hemma samt eventuella kostpreferenser. Appen genererar automatiskt en flerdagarsmeny anpassad efter tillgängliga ingredienser och minimerar behovet av nya inköp. En shoppinglista genereras automatiskt för saknade ingredienser.

---

## 2. MVP-funktioner

| # | Funktion | Prioritet |
|---|----------|-----------|
| 1 | Ingrediensinmatning via checklista (20–30 vanliga ingredienser) med stöd för fritext | Hög |
| 2 | Kostpreferenser och dietbehov (t.ex. vegetariskt, glutenfritt, nötfri) | Hög |
| 3 | AI-driven menygenerering via OpenAI API, minimerar nya ingredienser | Hög |
| 4 | Automatisk generering av shoppinglista baserad på vald meny | Hög |
| 5 | Batchlagningsinstruktioner (valfritt) – förbereda hela veckans mat på en dag | Medium |
| 6 | Användarinloggning via Supabase Auth | Medium |
| 7 | Sparande av menyer och preferenser per användare | Medium |

---

## 3. Användarscenarion (User Stories)

### US-01 – Ingrediensinmatning
> Som en förälder med lite tid vill jag kunna ange ingredienser jag redan har hemma så att jag får måltidsförslag utan att behöva handla först.

**Acceptanskriterier:**
- Användaren kan välja ingredienser från en checklista med 20–30 vanliga alternativ
- Användaren kan lägga till egna ingredienser via fritext
- Valda ingredienser visas tydligt innan generering

---

### US-02 – Kostpreferenser
> Som användare vill jag kunna ange mina kostpreferenser så att genererade måltider passar mitt hushålls behov.

**Acceptanskriterier:**
- Användaren kan välja ett eller flera dietalternativ (vegetariskt, veganskt, glutenfritt, laktosfritt, nötfri)
- Valda preferenser skickas med till AI-anropet
- Genererade recept respekterar angivna preferenser

---

### US-03 – Menygenerering
> Som användare vill jag få en AI-genererad veckomeny baserad på mina ingredienser så att jag slipper planera själv.

**Acceptanskriterier:**
- AI genererar minst 3–5 måltidsförslag
- Varje förslag innehåller namn, ingredienser och grundläggande instruktioner
- Menyn minimerar antal nya ingredienser som behöver köpas

---

### US-04 – Shoppinglista
> Som användare vill jag få en automatisk shoppinglista så att jag bara behöver köpa det som saknas.

**Acceptanskriterier:**
- Shoppinglistan genereras automatiskt baserat på vald meny och angivna ingredienser
- Listan visar endast ingredienser som inte redan angetts av användaren
- Listan kan visas och kopieras

---

### US-05 – Batchlagning (valfri)
> Som användare vill jag kunna få instruktioner för att förbereda hela veckans mat på en dag så att jag sparar tid under veckan.

**Acceptanskriterier:**
- Användaren kan välja att aktivera batchlagningsinstruktioner
- AI genererar en ordnad förberedelseplan för alla veckans måltider

---

### US-06 – Användarinloggning
> Som användare vill jag kunna logga in så att mina menyer och preferenser sparas mellan sessioner.

**Acceptanskriterier:**
- Användaren kan registrera sig och logga in via e-post och lösenord
- Session hanteras säkert via JWT-tokens
- Utloggning rensar sessionen korrekt

---

### US-07 – Sparade menyer
> Som inloggad användare vill jag kunna spara och återse tidigare genererade menyer så att jag kan återanvända dem.

**Acceptanskriterier:**
- Inloggad användare kan spara en genererad meny
- Sparade menyer visas i en lista under användarprofilen
- Användaren kan ta bort sparade menyer

---

## 4. Icke-funktionella krav

| Kategori | Krav |
|----------|------|
| Prestanda | AI-svar inom 10 sekunder under normala förhållanden |
| Tillgänglighet | Mobilanpassad, responsiv ned till 375px skärmbredd |
| Säkerhet | Autentisering via Supabase Auth med JWT-tokens. Service role key exponeras aldrig i frontend |
| Webbläsarstöd | Stöd för senaste versioner av Chrome, Firefox och Safari |
| Driftsättning | Backend deployad via Render, frontend via Vercel |
| Versionskontroll | Hela kodbasen hanteras via GitHub |

---

## 5. Teknikstack

| Lager | Teknologi |
|-------|-----------|
| Backend | Java 21, Spring Boot 3 |
| Frontend | React 18, Vite, TypeScript |
| AI | OpenAI API (GPT-4o) |
| Auth & Databas | Supabase (Auth + Postgres) |
| Backend deploy | Render |
| Frontend deploy | Vercel |
| Versionskontroll | GitHub |

---

## 6. Avgränsningar (utanför MVP)

- Ingen receptdatabas – all receptgenerering sker via AI
- Ingen kaloriräkning eller näringsinnehåll
- Ingen delning av menyer mellan användare
- Ingen mobilapp (webb endast)

---

## 7. Revideringshistorik

| Version | Datum | Förändring |
|---------|-------|------------|
| 1.0 | 2026-04-22 | Initialt dokument |
