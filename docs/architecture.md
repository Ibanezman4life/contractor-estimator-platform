\# Architecture



\## Product Type



White-label multi-company contractor estimating platform.



\## Main Entities



\- users

\- companies

\- company\_settings

\- pricing\_rules

\- template\_settings

\- customers

\- quotes

\- quote\_items

\- uploaded\_files

\- supplier\_results



\## Core Flows



\### 1. Signup / Login

User creates account and is tied to a company.



\### 2. Company Onboarding

User enters:

\- company name

\- contact info

\- address

\- service area

\- logo

\- branding defaults



\### 3. Pricing Setup

User sets:

\- labor rate

\- minimum labor

\- markup

\- tax settings

\- trip charge

\- rounding rules



\### 4. Template Setup

User configures:

\- logo on/off

\- show notes

\- show exclusions

\- show signature block

\- show labor/material split

\- show itemized materials

\- one-page vs detailed mode



\### 5. New Quote

User:

\- enters customer info

\- enters address

\- uploads photos

\- adds notes

\- selects job type



System:

\- AI analyzes job

\- suggests scope

\- suggests materials

\- estimates labor

\- applies company pricing rules

\- generates structured quote

\- creates branded PDF



\### 6. Supplier Search

System searches:

\- local suppliers

\- online suppliers

\- shipping options



Sort options:

\- cheapest

\- nearest

\- fastest delivery

\- lowest shipping

\- in stock

\- local pickup



\### 7. Quote History

User can:

\- save

\- edit

\- duplicate

\- export

\- resend



\## Folder Direction



\### api

FastAPI backend, database, services, models, routes



\### web

Next.js frontend with onboarding, dashboard, settings, quoting



\### docs

Architecture, schema, planning notes

