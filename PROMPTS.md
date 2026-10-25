# AI Prompts Log
Raw, unedited logs. One entry per session: date, tool.

## 2026-10-25 · Claude · Planning and architecture
I have a take home assingment which I am attaching you here. Now I am using vscode for the same, I have chatgpt go codex, github copilot for student. claude code free. I want to do some stuff manually while some with the help of chatgpt codex. Now how should I go about this project so that I do better than other students.
Most submissions will be a working app with a thin README, a few giant commits, and AI usage that’s vague or missing. This assignment grades process (TDD history, commit discipline, AI transparency) at least as much as the app. If you nail the process and the app is solid, you’ll be ahead of most people.

What reviewers will check
Git history: Do they see red (failing test), green (minimal implementation), refactor, as separate commits?
AI transparency: Co-author trailers on the right commits, a real “My AI Usage” section, and a raw PROMPTS.md.
Backend quality: Auth, roles, validation, a real database, and meaningful tests.
Frontend polish: Admin vs. user views, a disabled Purchase button at zero stock, and responsive design.
Deliverables: Screenshots, a test report, setup instructions, and ideally a live link.
Suggested stack
Backend: Node + TypeScript with NestJS (or Express if you want less ceremony), PostgreSQL via Docker Compose, and Prisma or TypeORM. Jest + Supertest for tests. NestJS’s modules and dependency injection make SOLID easy to demonstrate.
Frontend: React + Vite + TypeScript + Tailwind, with React Query for data fetching and React Testing Library for a few tests.
Extras: Swagger/OpenAPI docs, GitHub Actions CI that runs tests and coverage, and a .env.example.
Who does what

Do manually (this is what you’ll be interviewed on):

The data model, API design, and architecture decisions
Writing the tests first for the core logic: auth, purchase, restock, and role checks
The purchase logic, which must be atomic. Use a transaction or a conditional update (WHERE quantity > 0) so two simultaneous buyers can’t push stock negative. Few students will handle this, and it makes a good interview talking point.
The refactoring step

Delegate to Codex/Copilot:

Project scaffolding, config, Docker Compose, and CI YAML
Making failing tests pass once you’ve written them, then reviewing the diff yourself
Frontend components and Tailwind styling (a good place to iterate quickly)
Seed scripts, DTO boilerplate, and brainstorming extra edge-case tests
A README draft that you then edit

Use Claude Code free as a reviewer: Paste in a finished module and ask for a SOLID critique, missed edge cases, and security issues.

A good habit: write the failing test yourself, let the AI propose the implementation, and read every line before committing.

Commit discipline

Commit in this rhythm for every feature:

test: add failing test for purchase when stock is zero      (red)
feat: reject purchase when quantity is zero                 (green)
refactor: extract stock check into InventoryService         (refactor)

For commits where AI helped, add the trailer exactly as the brief describes, plus a line on what the AI did. Only add it when AI was actually used. Honest attribution matters more than having it on every commit.

PROMPTS.md

Since you’re using several tools, keep one running file from day one. Copy raw conversations in as you go, with a date and tool name per entry. Don’t summarize or clean anything. For Copilot and Codex, copy the chat panel content manually after each session. Reconstructing this at the end is painful and tempting to fake, so don’t leave it to the last day.

Things that set you apart
Authorization: Role-based guards for admin-only endpoints, with tests for 401 vs. 403. Hash passwords (bcrypt/argon2), validate input, and never return password hashes.
Search: Support make, model, category, and min/max price, combinable, plus pagination. Test the combinations.
Error handling: A consistent error response format and sensible status codes (404, 409, 422).
Seed script: Creates an admin and a normal user plus sample vehicles, so reviewers can try everything in two minutes.
One-command setup: docker compose up for the DB, and a clear README with admin credentials for demo.
Test report: Include a coverage summary (aim for 85%+ on backend services) and a screenshot or text of the results.
Frontend UX: Loading skeletons, toast notifications, empty states, confirmation dialogs on delete, filters in the URL, dark mode if you have time, and a mobile layout. Add a short GIF of the purchase flow to the README.
Deployment: Vercel for the frontend, Render or Railway for the API, and Neon or Supabase for Postgres. This is the brownie-points item, so do it last.
Suggested order of work
Repo setup, Docker Compose, CI, and an empty test running green.
Auth (register and login) with TDD.
Vehicle CRUD plus roles.
Search, then purchase and restock (the concurrency-safe part).
Frontend: auth, vehicle list and search, purchase, then the admin UI.
Polish, seed data, screenshots, README, and deployment.
Re-read your own code the night before the interview.
Interview prep

Be ready to explain why you chose your stack, how your purchase endpoint avoids race conditions, where AI got something wrong and you caught it, and what you’d improve with more time. Having one or two concrete stories about AI mistakes you fixed is far more convincing than saying AI saved you time.

If you’d like, I can help you draft the folder structure, the data model, or the first failing tests for the auth module.
okay I also want a deployed site for the same. Next I want you to tell me what exactly is this case study what is to be done. what are some of the most important use cases here

## What this assignment actually is

It's a **hiring take-home**, not just a coding exercise. You build a small full-stack app, a car dealership's inventory system, but the company is really evaluating **how you work**:

- Do you write tests first (TDD) and show it in your commit history?
- Is your code clean and structured (SOLID)?
- Can you use AI tools responsibly and honestly?
- Can you deliver a complete, documented, runnable product?

The dealership domain is simple on purpose, so the process is what differentiates candidates.

## What you need to build

**Backend (REST API + real database):**
- Register and login, returning a JWT
- Vehicle CRUD, with search and filter
- Purchase (decrements stock) and restock (increments stock)
- Role-based access: regular user vs. admin

**Frontend (React + Tailwind SPA):**
- Login and register screens
- A vehicle list with search and filters
- A Purchase button (disabled at zero stock)
- Admin-only UI to add, edit, and delete vehicles

**Process deliverables:**
- A public repo with red-green-refactor commits
- AI co-author trailers on the relevant commits
- A README with setup steps, screenshots, a test report, and a "My AI Usage" section
- A raw PROMPTS.md
- A deployed link (optional, but you want it)

## The most important use cases

**Anonymous visitor**
1. Register an account (validation, duplicate email rejected, password hashed)
2. Log in and receive a token
3. Hit a protected endpoint without a token and get 401

**Regular user**
4. Browse all vehicles
5. Search and filter by make, model, category, and price range, combined
6. **Purchase a vehicle**: stock goes down by one, and if stock is 0 the purchase is rejected (the button is disabled in the UI and the API also refuses)
7. Try an admin action and get 403 (forbidden, as opposed to 401)

**Admin**
8. Add a vehicle (with validation: price must be positive, quantity can't be negative)
9. Update a vehicle's details
10. Delete a vehicle
11. Restock a vehicle (quantity goes up)

**Edge cases (where you can stand out)**
- Two users buying the last car at the same instant: stock must never go negative (needs an atomic update or transaction)
- Purchase or update on a nonexistent vehicle returns 404
- Invalid input returns clear 4xx errors in a consistent format
- Password hashes never appear in any API response
- Expired or tampered tokens are rejected

**Priority:** if time is tight, the core flow is **auth, vehicle list and search, purchase with the stock rule, and admin-only guards**. These are what the tests and the interview will focus on. The admin forms and polish come after.

## Your deployed site

Plan on three pieces, all with free tiers:

| Part | Platform | Notes |
|---|---|---|
| Database | **Neon** or **Supabase** (Postgres) | Copy the connection string into your API's env vars |
| Backend API | **Render** or **Railway** | Free Render instances sleep after inactivity, so the first request can take 30-60s. Mention this in the README. |
| Frontend | **Vercel** or **Netlify** | Set `VITE_API_URL` to your deployed API URL |

Things that commonly break deployments:
- **CORS:** allow your frontend's deployed origin in the backend.
- **Migrations and seed:** run them against the production DB once, so the demo has data and an admin login.
- **Env vars:** `DATABASE_URL`, `JWT_SECRET`, and the frontend API URL are set in each platform's dashboard, never committed. Keep a `.env.example` in the repo.
- **SPA routing:** add a rewrite rule so refreshing on `/login` doesn't 404 (Vercel and Netlify both need a small config).
- **Demo credentials:** put an admin and a user login in the README so reviewers can try everything immediately.

Deploy a basic version early, even just a health-check endpoint and a blank page, and redeploy as you go. Doing it the last night is how people end up with a broken link.

If you want, I can sketch the data model and endpoint list next, or write the first failing auth tests so you can start the red-green cycle today.
alright now lets start first write the TDD for me first. that are must for this project. Then choose techstack that is free and also I want it deployed. I wantt o work in phases and each phase to be checked by me once done. Now tell me how this should be done. parts to be done by me and parts done by ai
Stack (all free)
Layer	Choice	Why
Backend	NestJS + TypeScript, Prisma ORM	Modules and DI make SOLID visible
Tests	Jest + Supertest against a real Postgres test DB	The brief rejects in-memory, and real Postgres is needed to prove the concurrency test
Database	Postgres: Docker locally, Neon in production	Neon’s free tier doesn’t expire
Frontend	React + Vite + TS + Tailwind, React Query, React Router	Matches the brief
CI	GitHub Actions	Runs tests and coverage on every push
Deploy	Render (API), Vercel (frontend), Neon (DB)	All have free tiers
How tests fit TDD

Writing all tests up front is not TDD, and your commit history needs red then green per feature. So below is the full must-have test list, which you implement one phase at a time. Each phase starts with the red commit.

Phases and who does what
Phase	You (manual)	AI (Codex/Copilot)	Your checkpoint
0. Setup	Decide the repo layout, create PROMPTS.md, make the first commit	Scaffold NestJS and Vite, Docker Compose, .env.example, CI YAML, test DB config	docker compose up works, npm test runs green with a dummy test, CI is green
1. Auth	Write the auth tests (below), review the implementation	Make them pass: User model, bcrypt, JWT, DTO validation	All auth tests pass, no password hash in any response
2. Vehicles + roles	Write the tests, design the Vehicle model and the roles guard	Controllers, DTOs, seed script	401 vs 403 behave correctly, CRUD works in Swagger or Postman
3. Search	Write the search tests, decide the pagination format	Implement the Prisma query builder	Combined filters return correct results
4. Purchase + restock	Write the concurrency test and the atomic update yourself (the interview centerpiece)	Only reviews and edge-case suggestions	10 parallel buyers on 3 cars gives exactly 3 successes
5. Frontend	Pages, API client structure, and route guards	Components, Tailwind styling, toasts, skeletons	Full flow works locally as user and as admin
6. Deploy	Set env vars, run migrations and seed on Neon	Render and Vercel config files, SPA rewrites, CORS	Live link works end to end with demo logins
7. Docs	“My AI Usage” reflection, final PROMPTS.md check	README draft, coverage summary	You can explain every part of the repo

Deploy a health-check skeleton in Phase 0 or 1, not Phase 6, so deployment problems show up early.

Must-have tests
Phase 1: Auth (test/auth.e2e-spec.ts)
ts
describe('POST /api/auth/register', () => {
  it('creates a user and returns 201 without a password or hash field');
  it('stores the password hashed, not in plain text');
  it('returns 409 for a duplicate email');
  it('returns 400 for an invalid email');
  it('returns 400 for a password shorter than 8 characters');
  it('ignores a "role: ADMIN" field in the body and creates a USER');
});

describe('POST /api/auth/login', () => {
  it('returns 200 and a JWT for valid credentials');
  it('returns 401 for a wrong password');
  it('returns 401 for an unknown email, with the same message as a wrong password');
});

describe('JWT protection', () => {
  it('returns 401 on a protected route with no token');
  it('returns 401 for a tampered token');
  it('returns 401 for an expired token');
});

The mass-assignment test (the role: ADMIN one) and the identical error message for unknown email vs. wrong password are the security details reviewers rarely see.

Phase 2: Vehicles and roles
ts
it('POST /vehicles: admin or user can create with valid data, returns 201');
it('POST /vehicles: returns 400 for negative price or negative quantity');
it('POST /vehicles: returns 401 without a token');
it('GET /vehicles: returns all vehicles, pagination supported');
it('PUT /vehicles/:id: updates fields and returns the updated vehicle');
it('PUT /vehicles/:id: returns 404 for a nonexistent id');
it('DELETE /vehicles/:id: returns 403 for a normal user');
it('DELETE /vehicles/:id: returns 204 for admin, 404 afterwards');
Phase 3: Search
ts
it('filters by make (case-insensitive)');
it('filters by model');
it('filters by category');
it('filters by minPrice and maxPrice');
it('combines make + category + price range');
it('returns an empty list, not an error, when nothing matches');
it('returns 400 when minPrice > maxPrice');

Put the search route above :id in the controller, or /vehicles/search will be parsed as an id. That’s a classic bug.

Phase 4: Purchase and restock (most important)
ts
describe('POST /vehicles/:id/purchase', () => {
  it('decreases quantity by 1 and returns the updated vehicle');
  it('returns 409 when quantity is 0');
  it('returns 404 for a nonexistent vehicle');
  it('returns 401 without a token');

  it('never lets stock go negative under concurrent purchases', async () => {
    const vehicle = await createVehicle({ quantity: 3 });
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .post(`/api/vehicles/${vehicle.id}/purchase`)
          .set('Authorization', `Bearer ${userToken}`),
      ),
    );
    const ok = results.filter((r) => r.status === 200).length;
    const rejected = results.filter((r) => r.status === 409).length;

    expect(ok).toBe(3);
    expect(rejected).toBe(7);
    expect(await stockOf(vehicle.id)).toBe(0);
  });
});

describe('POST /vehicles/:id/restock', () => {
  it('increases quantity by the given amount (admin)');
  it('returns 403 for a normal user');
  it('returns 400 for zero or negative amounts');
});

The implementation that passes the concurrency test is a single conditional update, such as updateMany({ where: { id, quantity: { gt: 0 } }, data: { quantity: { decrement: 1 } } }), then checking the affected count. A read-then-write version will fail this test, which is the point.

Phase 5: Frontend (a few, with React Testing Library)
ts
it('disables the Purchase button when quantity is 0');
it('hides admin controls for a normal user');
it('shows admin controls for an admin');
Test infrastructure for Phase 0 (let AI generate it)
A separate DATABASE_URL for tests, pointing at a Docker Postgres.
A helper that truncates tables between tests.
Helpers such as createUser(role), loginAs(user), and createVehicle(overrides).
Rules to keep your history clean
The red commit contains only the failing test. Let the AI see it, then ask it for the minimal code to pass.
Read every AI diff before committing, and add the co-author trailer only on commits where AI contributed.
Paste the chat into PROMPTS.md right after each session.
Stop at each checkpoint and show me what you have. I can review the code, the test output, and the commit history.

I’d suggest we start with Phase 0 now. Tell me whether you want the exact folder layout, Docker Compose file, and Jest config for the test DB, or whether you’d rather scaffold it with Codex and have me review the result.

yea lets starts. Also before start here is what I have thought for this project. RBAC - Admin (can add cars, delete cars etc.), Viewer just view if purchase clicked then register), Customer - (can purchase car). Build around it and add anything that is essential. Also I have less than 6 hours to placn accordingly. lets build the essential things first. Also the layout I'm planning should be search bar at top, white background, dark green  and light green type ui. Below the type bar should be filters, for different types like used new, km drive, type ev petrol diesel, etc, , price range,year, body type, transmission,  make and model. and images etc. Also find how to bring the dealership like data based of indian cars, images and details price (synthetic/ if online. and I am giving u a csv file and if this can be used. giving just 3 row of the dataset. 
new_car_detail	new_car_overview	new_car_feature	new_car_specs	car_links
{'it': 0, 'ft': 'Diesel', 'bt': 'SUV', 'km': '10,000', 'transmission': 'Automatic', 'ownerNo': 1, 'owner': '1st Owner', 'oem': 'Kia', 'model': 'Kia Seltos', 'modelYear': 2022, 'centralVariantId': 7121, 'variantName': 'GTX Plus Diesel AT', 'price': 'â‚¹ 19 Lakh', 'priceActual': '', 'priceSaving': '', 'priceFixedText': None, 'trendingText': {'imgUrl': 'https://stimg.cardekho.com/used-cars/common/icons/trending.svg', 'heading': 'Trending Car!', 'desc': 'High chances of sale in next 6 days'}}	{'heading': 'Car overview', 'top': [{'key': 'Registration Year', 'value': '2022', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/registrationYear.svg'}, {'key': 'Insurance Validity', 'value': 'Third Party insurance', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/insuranceValidity.svg'}, {'key': 'Fuel Type', 'value': 'Diesel', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/fuel.svg'}, {'key': 'Seats', 'value': '5 Seats', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/seats.svg'}, {'key': 'Kms Driven', 'value': '10,000 Kms', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/kmsDriven.svg'}, {'key': 'Ownership', 'value': 'First Owner', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/ownership.svg'}, {'key': 'Engine Displacement', 'value': '1493 cc', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/engineDisplacement.svg'}, {'key': 'Transmission', 'value': 'Automatic', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/transmission.svg'}, {'key': 'Year of Manufacture', 'value': 2022, 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/yearManufacture.svg'}], 'bottomData': None}	{'heading': 'Features', 'top': [{'value': 'Power Steering'}, {'value': 'Power Windows Front'}, {'value': 'Air Conditioner'}, {'value': 'Heater'}, {'value': 'Adjustable Head Lights'}, {'value': 'Fog Lights Front'}, {'value': 'Anti Lock Braking System'}, {'value': 'Brake Assist'}, {'value': 'Radio'}], 'data': [{'heading': 'Comfort & Convenience', 'subHeading': 'Comfort', 'list': [{'value': 'Power Steering'}, {'value': 'Power Windows Front'}, {'value': 'Power Windows Rear'}, {'value': 'Air Quality Control'}, {'value': 'Low Fuel Warning Light'}, {'value': 'Accessory Power Outlet'}, {'value': 'Trunk Light'}, {'value': 'Rear Reading Lamp'}, {'value': 'Rear Seat Headrest'}, {'value': 'Rear Seat Centre Arm Rest'}, {'value': 'Height Adjustable Front Seat Belts'}, {'value': 'Cup Holders Rear'}, {'value': 'Seat Lumbar Support'}, {'value': 'Multifunction Steering Wheel'}, {'value': 'Cruise Control'}, {'value': 'Rear ACVents'}, {'value': 'Navigation System'}, {'value': 'Smart Access Card Entry'}, {'value': 'Engine Start Stop Button'}, {'value': 'Voice Control'}, {'value': 'Steering Wheel Gearshift Paddles'}, {'value': 'Drive Modes'}, {'value': 'Remote Engine Start Stop'}, {'value': 'Adjustable Headrest'}]}, {'heading': 'Interior', 'subHeading': 'Interior', 'list': [{'value': 'Air Conditioner'}, {'value': 'Heater'}, {'value': 'Adjustable Steering'}, {'value': 'Digital Odometer'}, {'value': 'Tachometer'}, {'value': 'Electronic Multi Tripmeter'}, {'value': 'Leather Seats'}, {'value': 'Leather Steering Wheel'}, {'value': 'Glove Compartment'}, {'value': 'Digital Clock'}, {'value': 'Driving Experience Control Eco'}, {'value': 'Height Adjustable Driver Seat'}, {'value': 'Ventilated Seats'}, {'value': 'Leather Wrap Gear Shift Selector'}]}, {'heading': 'Exterior', 'subHeading': 'Exterior', 'list': [{'value': 'Adjustable Head Lights'}, {'value': 'Fog Lights Front'}, {'value': 'Power Adjustable Exterior Rear View Mirror'}, {'value': 'Electric Folding Rear View Mirror'}, {'value': 'Rain Sensing Wiper'}, {'value': 'Rear Window Wiper'}, {'value': 'Rear Window Washer'}, {'value': 'Rear Window Defogger'}, {'value': 'Alloy Wheels'}, {'value': 'Integrated Antenna'}, {'value': 'Rear Spoiler'}, {'value': 'Sun Roof'}, {'value': 'Moon Roof'}, {'value': 'Outside Rear View Mirror Turn Indicators'}, {'value': 'Chrome Garnish'}, {'value': 'Roof Rail'}, {'value': 'LEDDRLs'}, {'value': 'LEDHeadlights'}, {'value': 'LEDTaillights'}, {'value': 'LEDFog Lamps'}]}, {'heading': 'Safety', 'subHeading': 'Safety', 'list': [{'value': 'Anti Lock Braking System'}, {'value': 'Brake Assist'}, {'value': 'Centeral Locking'}, {'value': 'Power Door Locks'}, {'value': 'Child Safety Locks'}, {'value': 'Driver Air Bag'}, {'value': 'Passenger Air Bag'}, {'value': 'Side Air Bag Front'}, {'value': 'Day Night Rear View Mirror'}, {'value': 'Passenger Side Rear View Mirror'}, {'value': 'Rear Seat Belts'}, {'value': 'Seat Belt Warning'}, {'value': 'Vehicle Stability Control System'}, {'value': 'Traction Control'}, {'value': 'Adjustable Seats'}, {'value': 'Keyless Entry'}, {'value': 'Engine Immobilizer'}, {'value': 'Engine Check Warning'}, {'value': 'Tyre Pressure Monitor'}, {'value': 'Crash Sensor'}, {'value': 'Automatic Head Lamps'}, {'value': 'Ebd'}, {'value': 'Follow Me Home Headlamps'}, {'value': 'Rear Camera'}, {'value': 'Anti Pinch Power Windows'}, {'value': 'Speed Sensing Auto Door Lock'}, {'value': 'Isofix Child Seat Mounts'}, {'value': 'Heads Up Display'}, {'value': 'Pretensioners And Force Limiter Seatbelts'}, {'value': 'Blind Spot Monitor'}, {'value': 'Hill Assist'}, {'value': 'View360Camera'}, {'value': 'No Of Airbags'}, {'value': 'Eletronic Stability Control'}]}, {'heading': 'Entertainment & Communication', 'subHeading': 'Entertainment', 'list': [{'value': 'Radio'}, {'value': 'Speakers Front'}, {'value': 'Speakers Rear'}, {'value': 'Integrated2Din Audio'}, {'value': 'Bluetooth'}, {'value': 'Touch Screen'}, {'value': 'Number Of Speaker'}, {'value': 'Touch Screen Size'}, {'value': 'Apple Car Play'}, {'value': 'Android Auto'}, {'value': 'Wireless Phone Charging'}]}], 'commonIcon': 'https://stimg.cardekho.com/pwa/img/vdpN/tickG.svg'}	{'heading': 'Specifications', 'top': [{'key': 'Mileage', 'value': '18 kmpl'}, {'key': 'Engine', 'value': '1493 CC'}, {'key': 'Max Power', 'value': '113.43bhp'}, {'key': 'Torque', 'value': '250Nm'}, {'key': 'Wheel Size', 'value': '17'}, {'key': 'Seats', 'value': '5'}], 'data': [{'heading': 'Engine and Transmission', 'subHeading': 'Engine', 'list': [{'key': 'Color', 'value': 'Gray'}, {'key': 'Engine Type', 'value': '1.5 L CRDi VGT'}, {'key': 'Displacement', 'value': '1493'}, {'key': 'Max Power', 'value': '113.43bhp@4000rpm'}, {'key': 'Max Torque', 'value': '250Nm@1500-2750rpm'}, {'key': 'No of Cylinder', 'value': 4}, {'key': 'Values per Cylinder', 'value': 4}, {'key': 'Fuel Suppy System', 'value': 'CRDi'}, {'key': 'Turbo Charger', 'value': 'Yes'}]}, {'heading': 'Dimensions & Capacity', 'subHeading': 'Dimensions', 'list': [{'key': 'Length', 'value': '4315mm'}, {'key': 'Width', 'value': '1800mm'}, {'key': 'Height', 'value': '1645mm'}, {'key': 'Wheel Base', 'value': '2610mm'}, {'key': 'Kerb Weight', 'value': '1540'}]}, {'heading': 'Miscellaneous', 'subHeading': 'Miscellaneous', 'list': [{'key': 'Gear Box', 'value': '6-Speed'}, {'key': 'Drive Type', 'value': 'FWD'}, {'key': 'Seating Capacity', 'value': '5'}, {'key': 'Steering Type', 'value': 'Electric'}, {'key': 'Front Brake Type', 'value': 'Disc'}, {'key': 'Rear Brake Type', 'value': 'Disc'}, {'key': 'Tyre Type', 'value': 'Tubeless, Radial'}, {'key': 'Alloy Wheel Size', 'value': '17'}, {'key': 'No Door Numbers', 'value': '5'}, {'key': 'Cargo Volumn', 'value': '433'}]}], 'commonIcon': ''}	https://www.cardekho.com/used-car-details/used-Kia-Seltos-Gtx-Plus-Diesel-At-cars-Gurgaon_d4aa1aa7-0fbb-4da0-8aad-4644c5a32df8.htm
{'it': 0, 'ft': 'Petrol', 'bt': 'SUV', 'km': '57,437', 'transmission': 'Manual', 'ownerNo': 2, 'owner': '2nd Owner', 'oem': 'Hyundai', 'model': 'Hyundai Creta', 'modelYear': 2016, 'centralVariantId': 1449, 'variantName': '1.6 VTVT S', 'price': 'â‚¹ 7.62 Lakh', 'priceActual': '', 'priceSaving': '', 'priceFixedText': None, 'trendingText': {'imgUrl': 'https://stimg.cardekho.com/used-cars/common/icons/trending.svg', 'heading': 'Trending Car!', 'desc': 'High chances of sale in next 6 days'}}	{'heading': 'Car overview', 'top': [{'key': 'Registration Year', 'value': 'May 2016', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/registrationYear.svg'}, {'key': 'Insurance Validity', 'value': 'Zero Dep', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/insuranceValidity.svg'}, {'key': 'Fuel Type', 'value': 'Petrol', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/fuel.svg'}, {'key': 'Seats', 'value': '5 Seats', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/seats.svg'}, {'key': 'Kms Driven', 'value': '57,437 Kms', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/kmsDriven.svg'}, {'key': 'RTO', 'value': 'HR51', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/rto.svg'}, {'key': 'Ownership', 'value': 'Second Owner', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/ownership.svg'}, {'key': 'Engine Displacement', 'value': '1591 cc', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/engineDisplacement.svg'}, {'key': 'Transmission', 'value': 'Manual', 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/transmission.svg'}, {'key': 'Year of Manufacture', 'value': 2016, 'icon': 'https://images10.gaadi.com/listing/vdp/co/v1/yearManufacture.svg'}], 'bottomData': None}	{'heading': 'Features', 'top': [{'value': 'Power Steering'}, {'value': 'Power Windows Front'}, {'value': 'Air Conditioner'}, {'value': 'Heater'}, {'value': 'Adjustable Head Lights'}, {'value': 'Fog Lights Front'}, {'value': 'Anti Lock Braking System'}, {'value': 'Centeral Locking'}, {'value': 'Cd Player'}], 'data': [{'heading': 'Comfort & Convenience', 'subHeading': 'Comfort', 'list': [{'value': 'Power Steering'}, {'value': 'Power Windows Front'}, {'value': 'Power Windows Rear'}, {'value': 'Remote Trunk Opener'}, {'value': 'Remote Fuel Lid Opener'}, {'value': 'Low Fuel Warning Light'}, {'value': 'Accessory Power Outlet'}, {'value': 'Trunk Light'}, {'value': 'Vanity Mirror'}, {'value': 'Rear Seat Headrest'}, {'value': 'Rear Seat Centre Arm Rest'}, {'value': 'Cup Holders Front'}, {'value': 'Cup Holders Rear'}, {'value': 'Multifunction Steering Wheel'}, {'value': 'Rear ACVents'}]}, {'heading': 'Interior', 'subHeading': 'Interior', 'list': [{'value': 'Air Conditioner'}, {'value': 'Heater'}, {'value': 'Adjustable Steering'}, {'value': 'Digital Odometer'}, {'value': 'Tachometer'}, {'value': 'Electronic Multi Tripmeter'}, {'value': 'Fabric Upholstery'}, {'value': 'Glove Compartment'}, {'value': 'Digital Clock'}, {'value': 'Height Adjustable Driver Seat'}]}, {'heading': 'Exterior', 'subHeading': 'Exterior', 'list': [{'value': 'Adjustable Head Lights'}, {'value': 'Fog Lights Front'}, {'value': 'Power Adjustable Exterior Rear View Mirror'}, {'value': 'Rear Window Defogger'}, {'value': 'Power Antenna'}, {'value': 'Tinted Glass'}, {'value': 'Outside Rear View Mirror Turn Indicators'}, {'value': 'Smoke Headlamps'}, {'value': 'Roof Rail'}]}, {'heading': 'Safety', 'subHeading': 'Safety', 'list': [{'value': 'Anti Lock Braking System'}, {'value': 'Centeral Locking'}, {'value': 'Power Door Locks'}, {'value': 'Child Safety Locks'}, {'value': 'Anti Theft Alarm'}, {'value': 'Driver Air Bag'}, {'value': 'Passenger Air Bag'}, {'value': 'Day Night Rear View Mirror'}, {'value': 'Passenger Side Rear View Mirror'}, {'value': 'Halogen Headlamps'}, {'value': 'Rear Seat Belts'}, {'value': 'Seat Belt Warning'}, {'value': 'Door Ajar Warning'}, {'value': 'Side Impact Beams'}, {'value': 'Front Impact Beams'}, {'value': 'Adjustable Seats'}, {'value': 'Keyless Entry'}, {'value': 'Centrally Mounted Fuel Tank'}, {'value': 'Engine Immobilizer'}, {'value': 'Crash Sensor'}, {'value': 'Ebd'}, {'value': 'Follow Me Home Headlamps'}, {'value': 'Anti Theft Device'}]}, {'heading': 'Entertainment & Communication', 'subHeading': 'Entertainment', 'list': [{'value': 'Cd Player'}, {'value': 'Radio'}, {'value': 'Speakers Front'}, {'value': 'Speakers Rear'}, {'value': 'Integrated2Din Audio'}, {'value': 'Usb Auxiliary Input'}, {'value': 'Bluetooth'}, {'value': 'Touch Screen'}]}], 'commonIcon': 'https://stimg.cardekho.com/pwa/img/vdpN/tickG.svg'}	{'heading': 'Specifications', 'top': [{'key': 'Mileage', 'value': '15.29 kmpl'}, {'key': 'Engine', 'value': '1591 CC'}, {'key': 'Max Power', 'value': '121.3bhp'}, {'key': 'Torque', 'value': '151Nm'}, {'key': 'Seats', 'value': '5'}], 'data': [{'heading': 'Engine and Transmission', 'subHeading': 'Engine', 'list': [{'key': 'Color', 'value': 'White'}, {'key': 'Engine Type', 'value': 'VTVT Petrol Engine'}, {'key': 'Displacement', 'value': '1591'}, {'key': 'Max Power', 'value': '121.3bhp@6400rpm'}, {'key': 'Max Torque', 'value': '151Nm@4850rpm'}, {'key': 'No of Cylinder', 'value': 4}, {'key': 'Values per Cylinder', 'value': 4}, {'key': 'Value Configuration', 'value': 'DOHC'}, {'key': 'Fuel Suppy System', 'value': 'MPFI'}, {'key': 'Turbo Charger', 'value': 'No'}, {'key': 'Super Charger', 'value': 'No'}]}, {'heading': 'Dimensions & Capacity', 'subHeading': 'Dimensions', 'list': [{'key': 'Length', 'value': '4270mm'}, {'key': 'Width', 'value': '1780mm'}, {'key': 'Height', 'value': '1630mm'}, {'key': 'Wheel Base', 'value': '2590mm'}, {'key': 'Kerb Weight', 'value': '1,310'}]}, {'heading': 'Miscellaneous', 'subHeading': 'Miscellaneous', 'list': [{'key': 'Gear Box', 'value': '6 Speed'}, {'key': 'Drive Type', 'value': 'FWD'}, {'key': 'Seating Capacity', 'value': '5'}, {'key': 'Steering Type', 'value': 'Power'}, {'key': 'Turning Radius', 'value': '5.3 metres'}, {'key': 'Front Brake Type', 'value': 'Disc'}, {'key': 'Rear Brake Type', 'value': 'Drum'}, {'key': 'Top Speed', 'value': '165 Kmph'}, {'key': 'Acceleration', 'value': '10.5 Seconds'}, {'key': 'Tyre Type', 'value': 'Tubeless'}, {'key': 'No Door Numbers', 'value': '5'}, {'key': 'Cargo Volumn', 'value': '400-litres'}]}], 'commonIcon': ''}	https://www.cardekho.com/buy-used-car-details/used-Hyundai-Creta-1.6-Vtvt-S-cars-New-Delhi_444a8bad-3fd9-40dd-9d9d-a98405d0eada.htm

Decisions on your plan

RBAC. Your three tiers work, with one adjustment: “Viewer” shouldn’t be a database role. It’s simply an anonymous visitor.

Who	How they exist	Can do
Viewer	No account	Browse, search, filter, open vehicle details. Clicking Purchase sends them to Register/Login.
Customer	Default role on register	Everything above, plus purchase
Admin	Created by the seed script only	Add, edit, delete, restock
register always creates a CUSTOMER, never an admin. This is the mass-assignment test from before.
This changes two earlier tests: POST and PUT /vehicles are now admin only, and a customer gets 403.
Deviation from the brief: it marks GET /vehicles as protected, but your viewer needs to browse without logging in. Make the read endpoints (list, search, detail, filter options) public and say so in the README as a deliberate product decision. Write operations stay protected.

Additions that matter: a vehicle detail page (where Purchase lives for viewers), a GET /vehicles/filters endpoint that returns the available makes and ranges for your filter sidebar, sorting, and pagination. Skip order history, carts, and payments.

Using your CSV

Yes, it’s usable, but it needs a one-time conversion script (AI-assisted, you review):

Every column is a stringified Python dict, so parse with ast.literal_eval, not json.loads.
price is garbled (â‚¹ 19 Lakh), an encoding issue. Read the file as UTF-8 and parse the number with a regex, then convert Lakh to ×100,000 and Crore to ×10,000,000 into an integer rupee price.
km is "10,000", so strip the comma.
Vehicle field	Source
make, model, variant	oem, model, variantName
category	bt (SUV, Hatchback...)
fuelType	ft
transmission	transmission
year, kmDriven, ownerCount	modelYear, km, ownerNo
mileage, engineCc, powerBhp, seats, color	inside new_car_specs
features	new_car_feature, flattened to a short list of strings
quantity	synthetic: random 0 to 5, with a few at 0 so you can demo the disabled button
condition (New/Used)	synthetic: the data is all used cars, so tag newer, low-km cars as New, or add a few new ones

Images are the gap. The CSV has only icons, no car photos. Don’t scrape or hotlink CardDekho’s images, since that’s their content. Options:

Free-licence photos (Wikimedia Commons, Unsplash, Pexels) for about 15 to 20 popular models, mapped by model, with a body-type fallback.
Generated placeholders (a gradient card with the car name and body-type icon) as the fallback. This is fine for a take-home, and it’s faster.

Do option 2 first and upgrade to 1 if time allows. Also add a README line crediting the dataset’s origin (a public Kaggle CardDekho dataset, I assume) and noting that images are separate. Seed about 150 to 300 cleaned rows, not the whole file. Please upload the CSV or tell me its row count so I can suggest how to trim it.

Six-hour plan

I merged search into the vehicles phase to save time.

Time	Phase	Output
0:00 to 0:30	0. Setup	Repo, Docker DB, green dummy test, CI, health endpoint deployed
0:30 to 1:15	1. Auth	Register, login, JWT, roles, tests
1:15 to 2:15	2. Vehicles + search + seed	CRUD, admin guards, all filters, CSV import
2:15 to 2:45	3. Purchase and restock	Atomic purchase, concurrency test
2:45 to 4:45	4. Frontend	Green-themed UI, filters, auth, admin forms
4:45 to 5:30	5. Deploy	Neon, Render, Vercel, demo logins
5:30 to 6:00	6. Docs	README, screenshots, AI Usage, PROMPTS.md check

Cut first if behind: dark mode, GIF, Swagger, extra frontend tests, real photos. Never cut: red/green commits, the concurrency test, and the AI-usage docs.

UI direction

White background, dark green (
#14532d) for the header, buttons, and prices, and light green (
#dcfce7) for chips, hover states, and the filter panel. Layout: a top search bar, then a type bar (New, Used, EV, Petrol, Diesel) as chips, a left filter sidebar (price, year, km, body type, transmission, make, model) that collapses to a drawer on mobile, and a responsive card grid. Keep filters in the URL query string.

Phase 0: do it now

You do (about 10 min):

Create a public GitHub repo, dealership-inventory, and clone it into VS Code.
Create PROMPTS.md and paste this conversation in as the first entry (tool: Claude, date).
Commit: chore: initial commit with PROMPTS.md. This one has no AI trailer, since you wrote it.

AI does (Codex or Copilot, about 15 min): use this prompt and paste the raw exchange into PROMPTS.md afterwards:

Scaffold a monorepo: /backend (NestJS + TypeScript + Prisma + PostgreSQL, Jest + Supertest)
and /frontend (Vite + React + TS + Tailwind). Add:
- docker-compose.yml with two Postgres services: dev (port 5432) and test (port 5433)
- backend .env.example (DATABASE_URL, TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN)
- global prefix "/api", ValidationPipe with whitelist + forbidNonWhitelisted
- GET /api/health returning { status: "ok" }
- one dummy e2e test hitting /api/health against the test DB
- GitHub Actions workflow that starts Postgres, runs migrations, and runs backend tests with coverage
- root .gitignore
Do NOT implement auth or vehicles. Keep commits out of scope.

Your checkpoint:

docker compose up -d starts both databases
npm test in /backend is green
npm run start:dev serves /api/health
CI is green on GitHub
Optional but recommended: deploy the health endpoint to Render now (root dir backend) so deployment surprises show up early

Commit as chore: scaffold backend and frontend with CI with the co-author trailer, because AI generated it.

When that’s done, send me the repo link or a test output, plus the CSV row count. Then I’ll check Phase 0, and we start Phase 1: you write the auth tests (red commit), and I’ll review them before the AI touches the implementation.

how is this data set?
DVM-Car
A Large-Scale Dataset for Automotive Applications
This publicly available dataset aims to facilitate business related research and applications in automotive industry such as car appearance design, consumer analytics and sales modelling. To use, please go through the user manual

Recalling details about the DVM-Car dataset.
What DVM-Car is

As far as I know, it comes from the University of Warwick (the ECCV 2022 paper). It has about 1.4 million images covering roughly 900 car models from 2001 to 2020, plus metadata tables with sales, pricing, and advertising data. It’s built for research, such as appearance design and sales modelling. Please check the details on the official page, because I’m going from memory.

Is it a good fit for you? Mostly no.
Concern	Why it matters
UK market, not Indian	The prices are in GBP and the models are UK-sold. Many Indian staples (Creta, Nexon, Brezza, Swift Dzire, Innova Crysta) are missing or look different. Your CSV is already Indian, so mixing the two would make the data inconsistent.
Licence	It’s published for research use and you have to accept a user manual first. Committing its images to a public repo or deploying them on a public site is likely outside those terms. Read the licence before using any image.
Size	It’s many GB of images. That won’t fit in a GitHub repo, and it’s far too heavy for a 6-hour build and free hosting.
Mismatch with your schema	It’s built around registration and sales analytics, not an inventory with stock, mileage, and owner counts.
What I’d do instead
Use your CardDekho CSV as the data source. It’s Indian, has realistic prices, and covers every filter you planned (fuel, transmission, body type, owners, km, year).
Use generated placeholder images (a green gradient card with the car name and a body-type icon). They’re fast, safe, and match your theme.
Upgrade the images only if time remains: pick 10 to 15 popular models and use Wikimedia Commons or Unsplash photos with a credit line in the README. Their licences are explicit about reuse.
Skip DVM-Car, unless you want to mention it in the README as a dataset you evaluated and rejected, with the reasons above. That shows good judgment.

The CardDekho CSV itself is a scraped dataset, so credit its public source in the README and say it’s used for a demo.

Please send the CSV row count and the exact column list when you have it. In the meantime, go ahead with Phase 0 (repo, scaffold prompt, health endpoint). Send me the repo link or the test output when it’s done and I’ll check it before we write the auth tests.

sinc eI copies the csv I told about yesterday from a github repo cardekho csv is it okay to use as it in ther's terms and conditions also also plagiarism i snot allowed in this take home assignment as mentioned will i be able to use it?

Short answer

You can probably use it, but the safest route is not to ship the raw CSV. Here’s why.

Two separate issues

1. Plagiarism clause. It’s about code: “submitting code copied from other repositories or developers.” A data file used as seed input isn’t code plagiarism. The risk is if the reviewer sees an unattributed third-party file in your repo. The fix is simple: disclose it. Your own import script, schema, and app code must be written by you.

2. Licence and terms. This is the bigger risk, and I can’t see the repo, so please check these yourself:

Does the GitHub repo have a LICENSE file? If not, the default is “all rights reserved,” which means you have no formal right to redistribute it. If it has MIT, CC0, or a similar licence, you’re fine on that front.
Where did the repo author get the data? The car_links column points to cardekho.com pages, so it was almost certainly scraped. CardDekho’s terms most likely prohibit scraping and reuse, and the repo author can’t grant rights they don’t have.
Redistributing it in your public repo and on a deployed site is a bigger step than running it locally.

For a take-home, enforcement is very unlikely. The real risk is that a reviewer sees “copied scraped dataset” and wonders about your judgment.

What I’d do

Build your own seed data, using the CSV only as a reference for what realistic data looks like.

Don’t commit the CSV. Add it to .gitignore or don’t put it in the repo at all.
Write a seed generator yourself. Make a hand-written list of about 40 to 60 Indian models (make, model, body type, available fuel types and transmissions, a typical price range). Model names and body types are facts, not creative content.
Randomise the rest: year, km driven, owner count, exact price within the range, quantity (with a few at 0 for the disabled-button demo), condition New or Used, colour.
Never copy CardDekho URLs, icons, or images into the seed or UI.
Add one honest README line: “Seed data is synthetic, generated by seed/generate.ts. Model names and price ranges are modelled on publicly listed Indian market vehicles.”

This gives you a stronger interview answer than “I used a scraped CSV”: you can say you evaluated two datasets, rejected both over licensing, and generated your own. It also sidesteps the CSV encoding and parsing work, which saves time on a six-hour budget.

If you’d still like to use the CSV, check the repo’s LICENSE first. If it’s permissive, keep the file out of your repo, credit the source in the README, and use it only to derive your model list. Don’t redistribute it.

Phase 0 is still the next step. When you have the repo link or test output, send it over and I’ll check it before we start the auth tests.

okay lets start with phase 0

Setting up initial project scaffolding for the request.
Phase 0: Setup (about 30 min)
Step 1: You, no AI (10 min)
bash
# create an empty public repo on GitHub named dealership-inventory, then:
git clone https://github.com/<you>/dealership-inventory.git
cd dealership-inventory
code .

Create PROMPTS.md with this header, then paste our conversation under it:

md
# AI Prompts Log
Raw, unedited logs. One entry per session: date, tool.

## 2026-10-25 · Claude · Planning and architecture
<paste the full chat here>
bash
git add PROMPTS.md
git commit -m "chore: initial commit with PROMPTS.md"
git push

No co-author trailer on this commit, since you wrote it. (The chat is AI output, but the commit is just a log file. Add the trailer if you’d rather be strict.)

Step 2: AI scaffolds (15 min)

Open Codex (or Copilot agent mode) in the repo folder and paste the prompt from my last message, with these additions so you avoid common problems:

Extra requirements:
- Pin exact versions of Prisma and NestJS in package.json (no ^). 
- Prisma schema should have only the datasource and generator, no models yet.
- Jest e2e config must load TEST_DATABASE_URL (not DATABASE_URL) and run with --runInBand.
- Add npm scripts: test, test:e2e, test:cov, db:migrate, db:migrate:test.
- Frontend: Vite React TS template + Tailwind configured, one placeholder page, nothing else.
- Do not create any git commits.

Paste the raw exchange into PROMPTS.md right after, under a new dated entry.

Step 3: Review the output (your checkpoint)

Don’t just run it, read these four things. They’re where AI scaffolds usually go wrong:

docker-compose.yml: two Postgres services on different ports and volumes.

yaml
services:
  db:
    image: postgres:16
    ports: ["5432:5432"]
    environment: { POSTGRES_USER: dealer, POSTGRES_PASSWORD: dealer, POSTGRES_DB: dealership }
    volumes: [pgdata:/var/lib/postgresql/data]
  db_test:
    image: postgres:16
    ports: ["5433:5432"]
    environment: { POSTGRES_USER: dealer, POSTGRES_PASSWORD: dealer, POSTGRES_DB: dealership_test }
volumes:
  pgdata:

main.ts: the global setup must also be applied in the test app, or your tests will behave differently from production. A common fix is one shared configureApp(app) function used by both.

ts
app.setGlobalPrefix('api');
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

The health test should hit the real app through Supertest:

ts
it('GET /api/health returns ok', async () => {
  await request(app.getHttpServer()).get('/api/health').expect(200).expect({ status: 'ok' });
});

.gitignore must contain .env, node_modules, coverage, dist, and your CSV. .env.example is committed, .env never.

Step 4: Verify
bash
docker compose up -d
cd backend && cp .env.example .env
npm install
npm test            # green
npm run test:e2e    # green, against port 5433
npm run start:dev   # then open http://localhost:3000/api/health
cd ../frontend && npm install && npm run dev   # blank green-ready page loads

Then push and confirm the GitHub Actions run is green. Fix CI now, because a red badge on the repo looks bad for the whole assignment.

Step 5: Commit
bash
git add .
git commit -m "chore: scaffold backend and frontend with CI

Used Codex to generate the NestJS/Vite scaffolding, docker-compose,
and CI workflow. Reviewed the config and test setup manually.


Co-authored-by: ChatGPT Codex <AI@users.noreply.github.com>"
git push

Use that two-blank-lines format, as the brief specifies. Use the name of the tool that actually did the work.

Step 6: Early deploy (optional, 15 min, worth it)

Do this now only if Phase 0 went smoothly. Otherwise do it right after Phase 1.

Neon: create a project and copy the connection string.
Render: new Web Service, root directory backend, build npm ci && npx prisma generate && npm run build, start node dist/main, and set DATABASE_URL and JWT_SECRET.
Confirm https://<your-service>.onrender.com/api/health responds. The first hit may take 30 to 60 seconds on the free tier.
What to send me

Any of these works, whichever is easiest:

The repo link, or
The output of npm test and npm run test:e2e, plus the green CI status, plus the contents of docker-compose.yml and main.ts

I’ll review it against the checklist above. Once it passes, Phase 1 starts: you write the auth tests (the red commit) and I review them before any AI touches the implementation.

Scaffold a monorepo: /backend (NestJS + TypeScript + Prisma + PostgreSQL, Jest + Supertest)
and /frontend (Vite + React + TS + Tailwind). Add:
- docker-compose.yml with two Postgres services: dev (port 5432) and test (port 5433)
- backend .env.example (DATABASE_URL, TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN)
- global prefix "/api", ValidationPipe with whitelist + forbidNonWhitelisted
- GET /api/health returning { status: "ok" }
- one dummy e2e test hitting /api/health against the test DB
  Extra requirements:
- Pin exact versions of Prisma and NestJS in package.json (no ^).
- Prisma schema should have only the datasource and generator, no models yet.
- Jest e2e config must load TEST_DATABASE_URL (not DATABASE_URL) and run with --runInBand.
- Add npm scripts: test, test:e2e, test:cov, db:migrate, db:migrate:test.
- Frontend: Vite React TS template + Tailwind configured, one placeholder page, nothing else.
- Do not create any git commits.
- GitHub Actions workflow that starts Postgres, runs migrations, and runs backend tests with coverage
- root .gitignore
  Do NOT implement auth or vehicles. Keep commits out of scope.
  Scaffold complete—no commits created.

- Backend NestJS + TypeScript + Prisma configuration, health endpoint at `/api/health`, shared global validation/prefix setup, scripts, exact NestJS/Prisma pins, and a model-free Prisma schema.
- E2E health test explicitly uses `TEST_DATABASE_URL` to connect to the test Postgres instance before calling the API.
- Frontend Vite React TS + Tailwind placeholder page.
- Root Docker Compose with dev Postgres on `5432` and test Postgres on `5433`.
- GitHub Actions workflow installs, migrates, runs coverage, and executes e2e tests.
- Root `.gitignore` and backend `.env.example` added.

Verified locally:

- `backend npm run build` ✅
- `backend npm test` ✅
- `frontend npm run build` ✅

I could not run `test:e2e` because Docker is not installed in this environment. Once Docker is available:

```powershell
docker compose up -d
Copy-Item backend/.env.example backend/.env
cd backend
npm run db:migrate:test
npm run test:e2e
```

Key files: [docker-compose.yml](C:\Users\ESHAAN GUPTA\Desktop\dealership-inventory\dealership-inventory\docker-compose.yml), [backend package.json](C:\Users\ESHAAN GUPTA\Desktop\dealership-inventory\dealership-inventory\backend\package.json), [e2e test](C:\Users\ESHAAN GUPTA\Desktop\dealership-inventory\dealership-inventory\backend\test\health.e2e-spec.ts), [CI workflow](C:\Users\ESHAAN GUPTA\Desktop\dealership-inventory\dealership-inventory\.github\workflows\ci.yml).

