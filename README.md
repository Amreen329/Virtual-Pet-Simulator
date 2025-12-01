# Virtual Pet Simulator

An interactive **Virtual Pet Simulator** built with HTML, CSS, and JavaScript.  
Keep your pet healthy by managing its **hunger**, **happiness**, and **energy**.


## How to Play

- **Feed (🍖)**  
  - Lowers the **Hunger** value (which is good – 0 means full, 100 means starving).  
  - Slightly increases **Happiness** and **Energy**.

- **Play (🎾)**  
  - Greatly increases **Happiness**.  
  - Uses **Energy** and makes your pet a little hungrier.  
  - If your pet is too hungry or too tired, it will refuse to play.

- **Sleep (🌙 / Wake up)**  
  - Toggles sleep mode on and off.  
  - While sleeping:
    - **Energy** recovers quickly.
    - **Hunger** still slowly increases.
    - **Happiness** decreases a little over time (missing you!).

- **Reset (🔄)**  
  - Restores default starting values for all attributes and wakes the pet up.

## Game Logic & Attributes

- **Attributes**  
  - **Hunger:** 0 (full) → 100 (very hungry)  
  - **Happiness:** 0 (sad) → 100 (very happy)  
  - **Energy:** 0 (exhausted) → 100 (full of energy)

- **Automatic Changes (every few seconds)**
  - Hunger slowly increases over time (faster when awake).
  - Energy decreases while awake and recovers during sleep.
  - Happiness goes up when the pet is in good condition and down when it is hungry, tired, or ignored.

- **Visual Feedback**
  - Attribute levels are shown with **animated progress bars** and numeric values.
  - The pet's **face and posture change** depending on its state:
    - Happy, hungry, sad, sleeping, or excited.
  - A simple **day/night cycle** changes the background to night when the pet is in poor condition (very hungry, very tired, or very unhappy), and back to day when it recovers.
