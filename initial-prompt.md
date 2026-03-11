Build a single-page web application and prepare it for deployment via GitHub Pages.

---

# TECH STACK

* Svelte (latest stable)
* TypeScript
* Vite
* Vitest for testing
* No backend
* All calculations client-side
* No external probability libraries

---

# PURPOSE

Create a probability calculator for combat resolution in Middle Earth Strategy Battle Game.

The application must support two calculation modes selectable by the user:

1. Fast (Monte Carlo simulation)
2. Exact (Exact probability computation)

After calculation completes, display:

* Computation time in milliseconds
* Mode used

Use `performance.now()` to measure probability engine execution time only.

---

# EXACT MODE LIMITATION

If total attacks across both sides exceed 15 AND user selects Exact mode:

* Do NOT start calculation
* Display warning:

> "Exact mode disabled: more than 15 total attacks would result in excessive computation time. Please use Fast mode."

Total attacks = sum of A of all units on both sides.

---

# UNIT MODEL

Each unit contains:

* Fv: integer > 0 (default 4)
* S: integer [1–10] (default 4)
* D: integer [1–10] (default 5)

  * Only editable for first unit per side
  * ALL wound calculations use ONLY the first unit's D of defending side
* A: integer > 0 (default 1)
* 2H: boolean (default false)
* Sv: integer [1–6] (default 4)
* SS: integer [1–10] (default 2)

---

# DUEL RESOLUTION

Each unit rolls A d6 dice.

If 2H enabled:

* If duel roll in [2–5], subtract 1
* Rolls 1 and 6 unchanged

Each side combines all dice.

Winner:

1. Highest single die wins
2. If tied:

   * Compare highest Fv among units that produced that highest die
   * Higher Fv wins
3. If still tied:

   * Resolve randomly
   * Each side receives 50% of that probability mass
   * Therefore:

     * P(Good wins) + P(Evil wins) = 1
     * P(Tie) = 0

---

# WOUND CALCULATION

## Step 1: Base ToWound

ToWoundRaw = ceil((D - S) / 2) + 4

Rules:

* Use ONLY FIRST defending unit's D
* Clamp minimum ToWound to **3**
* If ToWoundRaw ≤ 6:

  * ToWound = max(3, ToWoundRaw)
  * No hard wound required
* If ToWoundRaw > 6:

  * ToWound = 6
  * HARD WOUND LOGIC activates

---

# HARD WOUND LOGIC (Corrected Version)

If ToWoundRaw > 6:

To successfully make a wound:

1. The unit must FIRST pass the normal ToWound check (against 6).
2. THEN it must ALSO pass a second ToWoundHard check.

Both checks are required.

---

## ToWoundHard Calculation

ToWoundHard = D - S - 1

Rules:

* If ToWoundHard > 6:

  * Wound is impossible (probability = 0)
* If ToWoundHard < 3:

  * Clamp ToWoundHard to 3
* Otherwise:

  * Roll d6
  * If roll ≥ ToWoundHard → pass

Important:

* 2H modifier also applies to ToWoundHard roll
* 2H rule:

  * If roll in [1–5], add +1
  * 6 unchanged

---

# ATTACK RESOLUTION (Full Sequence)

For each attack die:

1. Roll d6
2. If 2H enabled:

   * If roll in [1–5], add +1
3. Check against ToWound
4. If ToWoundRaw > 6:

   * If first check passes:

     * Roll second d6
     * Apply 2H modifier
     * Compare against ToWoundHard
     * Only if both pass → wound

---

# WOUNDS ONLY IF DUEL WON

Melee wounds are rolled ONLY if that side wins the duel.

Conditional probabilities must be computed properly.

---

# RANGED WOUNDS

For ranged:

* Use Sv as hit threshold
* Use SS instead of S
* Use defender FIRST unit's D
* Apply same ToWound and HARD WOUND logic
* No duel required for ranged wounds

---

# COMPUTE FOR BOTH SIDES

1. P(side wins duel)
2. P(single attack wounds)
3. P(≥1 wound)
4. P(≥2 wounds)
5. P(≥3 wounds)
6. P(≥1, ≥2, ≥3 wounds | duel win)
7. P(ranged wound)

---

# FAST MODE

* Monte Carlo simulation
* Default 100,000 iterations
* Adjustable constant
* No object allocations inside main loop
* Optimized loops
* Optional seed for reproducibility

---

# EXACT MODE

* Deterministic probability computation
* Must support:

  * Multiple units
  * Multiple attacks
  * Tie-breaking
  * Conditional wounds
  * HARD WOUND double-check logic
* Reject if total attacks > 15

---

# TESTING (Vitest)

Minimum 4 separate scenario files.

Each scenario must:

* Export structured input
* Export expected probabilities
* Export tolerance value
* Run Exact and Fast modes
* Verify:
  abs(actual - expected) ≤ tolerance

Tolerance must be configurable per test.

Include at least one HARD WOUND test case.