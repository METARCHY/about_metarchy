# Metarchy: MVP Rulebook

Welcome to the official MVP rules for **Metarchy**, a turn-based strategy game of hidden information, psychological deduction, and resource management.

## 🎯 Goal of the Game
The ultimate objective is to accumulate the highest number of **Victory Points** by the end of the game's final Turn. 
A **Victory Point** is earned by collecting a full set of the three Value Tokens:
`1 Victory Point = 1 Power + 1 Art + 1 Knowledge`

If players have an equal number of Victory Points at the end of the final Turn, an extra tie-breaker Turn is played between those tied players.

## Gaming Terminology

- **Conflict** - If two or more Actors of the same type meet in one Location, they will have a Conflict. If Actors have a Conflict, players need to start the process of Conflict Resolution.
- **Conflict Resolution** - Each player chooses Rock, Paper, or Scissors. Each player knows only their own choice, but not the other players' choices. After all players have made their choices, their choices are revealed. The Outcome of the Conflict can be Win, Lose or Draw. If the Conflict Outcome is a Draw then repeat the Conflict Resolution unless otherwise stated in the rules.
- **Outcome** - result of the Conflict Resolution. It can be Win, Lose or Draw.
- **Location** - part of the game field. Locations is doing nothing by itself. Players can send Actors to the Locations.
- **Actor** - main charecters of each player. Players send Actors to the Locations. Actors produce Values or Resources in the Locations.
- **Argument** - when sending an Actor to a Location, player MUST give an Argument to Actor. Each Actor must to have an Argument. Each Actor can get only one Argument. Actors of the same player must have different Arguments.
- **Bet** - when sending an Actor to a Location, player MAY add a Bet on Outcome to Actor. To add a Bet on the Outcome of a Conflict, a player must use a Resource. If a player does not have the required Resource, player cannot add a Bet to Actor. Player can't add more than one Bet to one Actor. If Outcome of the Conflict is the same as a Bet, then Bet is succesful. If Outcome of the Conflict is other than a Bet, then Bet is faild. Regardless of whether the Bet was successful or faild, the Bet Resource is discarded and is not returned to the player.

## 🔬 Game Components

### 1. Players
The game supports 2 to 3 players, or "2 vs. 2" mode.
Exch player starts the game with:
- 4 Actors (Politician, Scientist, Artist, Robot)
- 4 Arguments (Rock, Scissors, Paper, Dummy)
- 3 Resources (1 Production, 1 Electricity, 1 Recycling)

### 2. The Game Board (Locations)
The board consists of 6 distinct Locations where Conflicts are happening:
**Human Locations:**
- 🏛️ **University** (You can send here Politician or Scientist)
- 🎭 **Theater** (You can send here Scientist or Artist)
- ⛲ **Square** (You can send here Politician or Artist)

**Robot Locations:**
- 🏭 **Factory** (You can send here Robot)
- ⚡ **Energy Plant** (You can send here Robot)
- 🗑️ **Dump** (You can send here Robot)

### 3. Actors (4 Types per Player)
Actors are sent to Locations to create values.
- 👔 **Politician** (Players can only send Politician to the Square and University locations.)
  - A Politician in the Square or University location creates the Value - Power.
  - If two or more Politicians are in the Square or University Location, a Conflict occurs between the Politicians.
  - For each Politician, the Conflict Outcome can be Win, Lose or Draw.
  - If Outcome is Win - Politician returns to Player-owner with Value Power.
  - If Outcome is Lose - Politician returns to Player-owner without anything. 
  - If Outcome is Draw, players need to Resolve the Conflict until Outcome of the Conflict Win-Lose. 
- 🧑🔬 **Scientist** (Players can only send Scientist to the Theater and University Locations.)
  - A Scientist in the Theater or University Location produces the Value - Knowledge.
  - If two or more Scientists are in the Theater or University Location, a Conflict occurs between the Scientists.
  - For each Scientist, the Conflict Outcome can be Win, Lose or Draw.
  - If Outcome is Win - Scientist returns to Player-owner with Value Knowledge.
  - If Outcome is Lose - Scientist returns to Player-owner without anything. 
  - If Outcome is Draw, players don't need to Resolve the Conflict. All Scientists return to Player-owners with Value Knowledge. ("Draw between Scientists" is the same as "All Scientists Win")
- 🧑🎨 **Artist** (Players can only send Artist to the Theater and Square Locations.)
  - An Artist in the Theater or Square Location creates the Value - Art.
  - If two or more Artists are in the Theater or Square Location, a Conflict occurs between the Artists.
  - For each Artist, the Conflict Outcome can be Win, Lose or Draw.
  - If Outcome is Win - Artist returns to Player-owner with Value Art.
  - If Outcome is Lose - Artist returns to Player-owner without anything. 
  - If Outcome is Draw, players don't need to Resolve the Conflict. All Artists return to Player-owners without anything. ("Draw between Artists" is the same as "All Artists Lose")
- 🤖 **Robot** (Players can send an Actor-Robot to these Locations: Factory, Power Plant, or Dump.)
  - A Robot in the Factory Location produces three units of Rescourses - Product.
  - A Robot in the Power Plant Location produces three units of Rescourses - Electricity.
  - A Robot in the Dump Location produces three units of Rescourses - Recycling.
  - If two or more Actor-Robots are in the Factory, Power Plant, or Dump Location, a Conflict occurs between the Robots.
  - For each Robot, the Conflict Outcome can be Win, Lose or Draw.
  - If Outcome is Win - Robot returns to Player-owner with 3 Resources of Product/Electricity/Recycling (depending on the Location).
  - If Outcome is Lose - Robot returns to Player-owner without anything. 
  - If Outcome is Draw - Robot returns to Player-owner with 1 Resource of Product/Electricity/Recycling (depending on the Location).

### 4. Arguments (4 Types)
When Player send an Actor to Location, Player must give an Argument to Actor.
- 🪨 **Rock** *(Loses to Paper. Wins against Scissors and Dummy. Draws against Rock).*
- ✂️ **Scissors** *(Loses to Rock. Wins against Paper and Dummy. Draws against Scissors).*
- 📄 **Paper** *(Loses to Scissors. Wins against Rock and Dummy. Draws against Paper).*
- 🪆 **Dummy** *(Loses to Rock, Paper, and Scissors. Draws against another Dummy).*

### 5. Values
Required to form Victory Points. 1 Power + 1 Art + 1 Knowledge = 1 Victory Point
- 👑 **Power** (Created by Politics in Square/University)
- 🎨 **Art** (Created by Artists in Theater/Square)
- 📖 **Knowledge** (Created by Scientists in University/Theater)

### 6. Resources
Used to add bets on Conflict Outcome.
- ⚙️ **Production** (Used to bet on "Win". If the Conflict Outcome for Actor is Win, this Actor will return to Player-owner with one more additional Value or Resource, depending on the Actor.)
- 🔋 **Electricity** (Used to bet on "Lose". If the Conflict Outcome for Actor is Lose, then Resolve the Conflict one more time.)
- ♻️ **Recycling** (Used to bet on "Draw". If the Conflict Outcome for Actor is Draw, then count Outcome as a Win for this Actor.)

## ⏳ Game Flow & Phases
Depending on the player count, the game spans a specific number of Turns:
- **2 Players:** 5 Turns
- **3 Players:** 5 Turns
- **4 Players (2vs2):** Short game 4 Turns, Long game 6 Turns

Every Turn is divided into Phases, completed in order:

### Distribution Phase
- Players send their Actors to the Locations.
- Players give Arguments to their Actors.
- Players may add Bets to their Actors.
- Each Player knows only distribution of own Actors, but don't know distribution of Actors of other players.
After Players go to the next Phase.

### Conflict Resolution Phase
- If in the Location the only one Actor of one type (the only one Politician, the only one Scientist, the only one Artist, the only one Robot) - such an Actor doesn't have a Conflict, and game count such an Actor as a Winner. Such an Actor returns back to Player and brings a Value or 3 Resources (depends of Actor type). If such an Actor had a Bet on Win, then a Bet is succesful, and it brings additional Value or Resource to Player. However, if a Bet was on a Draw or Lose, the Bet is faild. All Resources used as Bets are not returned, regardless of succesful or failed bet.
- If two or more Actors of the same type are in the same Location, a Conflict occurs between these Actors
- All Actors involved in the Conflict reveal their Arguments and Bets.
- Conflicts between Actors can have Outcome: "Win", "Draw" or "Loss".
- If Actors had Bets, then compare Outcome with Bets:
    - If the Conflict Outcome matches the Bet, the Bet is successful.
    - If the Conflict Outcome does not match the Bet, the Bet is faild.
    - All Resources used as Bets don't return, regardless of the Conflict Outcome.
- If for the Actor, Outcome of the Conflict is **Win:** The Actor produce Value or 3 Resources in the Location and bring it to a Player-owner.
- If for the Actor, Outcome of the Conflict is **Lose:** The Actor leave the Location and doesn't bring any Value or Resources to a Player-owner.
- If for the Actor, Outcome of the Conflict is **Draw:** 
  - For Politicians: Resolve the Conflict until Outcome is Win-Lose. Politician-winner creates Value Power and brings it to a Player-owner.
  - For Scientists: no needs to Resolve the Conflict, all Scientists considered as winners, all of them create Value Knowledge and bring it to players-owners.
  - For Artists: no needs to Resolve the Conflict, all Artists leave the location and considered as losers. Players-owners don't get Value Art.
  - For Robots: no needs to Resolve the Conflict, all Robots create only 1 Resource instead of 3 Resources and bring it to players-owners.

- After, Players count amount of Values and Resources, and go to the next Turn.
- If it was the final Turn, game ends after Conflict Resolution Phase, and players count their Victory Points to determine the ultimate winner!
- If two or more players have the same amount of Victory Points, they play one more Turn.
