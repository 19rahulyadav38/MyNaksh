# **Technical Assessment: Build the Next Generation AI Conversation Experience**

**Time Limit:** 3 Hours

**Primary Stack**

* React Native (CLI preferred)  
* TypeScript  
* React Navigation  
* React Native Reanimated  
* State Management of your choice (Redux Toolkit / Zustand / Context API)

You may use any open-source libraries where appropriate.

# **1\. Project Overview**

At MyNaksh, conversations are no longer just chat messages.

Every AI response can evolve into an interactive experience by surfacing personalized recommendations such as Tarot Readings, Gemstones, Remedies, Panchang, Consultations, Educational Content and future AI-powered experiences.

As our AI platform grows, these recommendation types will continue to evolve. The frontend should be designed so that new experiences can be introduced without requiring major architectural changes.

Your task is to build the core AI Conversation Experience that powers these interactions.

We are less interested in pixel-perfect UI and more interested in how you structure your application, design reusable components and think about scalability.

# **2\. The Task**

Build an AI-powered conversation screen capable of rendering dynamic recommendation experiences alongside a modern chat interface.

The assignment consists of **two parts**.

# **Part A — Build a Composable AI Conversation Experience (Primary Requirement)**

Imagine the backend AI can return not only text responses but also different "conversation experiences."

Each AI response may contain zero or more recommendations that guide the user toward the next action.

Examples include:

* 🔮 Tarot Reading  
* 💎 Gemstone Recommendation  
* 📅 Panchang  
* 🪔 Remedy  
* 👨‍🏫 Consult an Astrologer  
* 🎁 Promotional Offer

An example conversation could look like:

AI

Saturn currently has a strong influence on your career growth.

* 🔮 Career Tarot Reading  
* 💎 Blue Sapphire  
* 📅 Saturday Remedy  
* 👨‍🏫 Talk to an Astrologer

## **Core Requirements**

### **1\. Conversation Timeline**

Render a conversation supporting multiple message types:

* User  
* AI Assistant  
* Human Astrologer  
* System Events

The timeline should include:

* Virtualized chat list  
* Auto-scroll to latest message  
* Date separators  
* Message grouping  
* Reusable message components

### **2\. Dynamic Recommendation Framework**

This is the most important part of the assignment.

Design a recommendation system capable of rendering multiple recommendation experiences.

Example recommendation types:

* gemstone  
* tarot  
* consultation  
* article  
* promotion

Each AI response can contain multiple recommendations.

Requirements:

* Multiple recommendation cards per message  
* Horizontal scrolling cards  
* Clean reusable architecture  
* Easy to extend with future recommendation types  
* Clicking a recommendation card may simply show an Alert

We intentionally do **not** prescribe how this should be implemented. We are evaluating your architectural decisions.

### **Mock API Response**

Use the following payload as the initial conversation state.

\[  
  {  
    "id": "1",  
    "type": "system",  
    "text": "Your session with AI Astrologer has started."  
  },  
  {  
    "id": "2",  
    "type": "user",  
    "text": "Can you tell me about my career this year?"  
  },  
  {  
    "id": "3",  
    "type": "ai",  
    "text": "I can already see a strong Saturn influence in your chart. Based on this, here are a few recommendations that may help you.",  
    "recommendations": \[  
      {  
        "id": "1",  
        "type": "gemstone",  
        "title": "Blue Sapphire",  
        "subtitle": "Recommended for Saturn"  
      },  
      {  
        "id": "2",  
        "type": "tarot",  
        "title": "Career Tarot Reading"  
      },  
      {  
        "id": "3",  
        "type": "consultation",  
        "title": "Talk to an Astrologer"  
      },  
      {  
        "id": "4",  
        "type": "article",  
        "title": "Understanding Saturn Mahadasha"  
      }  
    \]  
  },  
  {  
    "id": "4",  
    "type": "human",  
    "text": "I also recommend focusing on your upcoming Jupiter transit."  
  }  
\]

Feel free to extend this schema if required.

# **Part B — Build a Production Conversation Experience**

Once the conversation framework is in place, implement the following production-ready interactions.

## **Conversation Actions**

Long pressing an AI message should provide actions such as:

* Reply  
* Copy  
* Delete

Requirements

Delete should:

* Remove the message  
* Update local state  
* Preserve the conversation position

Reply should display a reply preview above the message composer.

## **AI Feedback**

Each AI response should allow user feedback.

Display:

👍 Like

👎 Dislike

When Dislike is selected, expand feedback chips such as:

* Inaccurate  
* Too Generic  
* Didn't Help  
* Too Long

Selecting a chip should update local state.

## **Sending Messages**

Implement a message composer.

When sending messages:

* Optimistically add the message to the conversation  
* Simulate an API delay  
* Show appropriate message states

Example:

* Sending...  
* Sent  
* Failed  
* Retry

## **Loading & Error States**

Handle common application scenarios:

* Initial Loading  
* Loading conversation...  
* Empty State  
* Start your conversation.  
* Network Failure  
* Unable to load conversation.  
* Retry

# **3\. Constraints & Expectations**

* The assignment is designed to be completed within **3 hours**.  
* Partial completion is acceptable.  
* Prioritize architecture over visual polish.  
* Focus on reusable components.  
* Backend integration is **not required**.  
* Mock APIs are sufficient.  
* TypeScript is preferred.

# **4\. Submission Guidelines**

## **Deliverables**

* Public GitHub Repository or Downloadable zip  
* Screen Recording (2–5 minutes)  
* README.md

## **README Must Include**

Briefly explain:

* Project structure  
* Component architecture  
* State management approach  
* Recommendation rendering strategy  
* Performance considerations  
* Trade-offs made due to time constraints

