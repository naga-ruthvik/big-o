# Neuro-DSA Tracker: Comprehensive Test Plan

## 1. Data Integrity & Management
- **Create Problem**:
    - [ ] Open "New Logic Card" modal.
    - [ ] Fill all fields (Title, Topic, Pattern, Signal, AHA, Code).
    - [ ] Save and verify it appears in the list.
- **Edit Problem**:
    - [ ] Click "Edit" icon.
    - [ ] Change "Difficulty" or "Pattern".
    - [ ] Save and confirm changes reflect in list.
- **Persistence**:
    - [ ] Reload page.
    - [ ] Verify data persists (LocalStorage check).

## 2. Recall Engine & Anti-Byheart
- **Signal Identification**:
    - [ ] Enter "Recall Mode".
    - [ ] Input wrong pattern -> Verify "Not quite" feedback.
    - [ ] Input correct "fuzzy" pattern -> Verify success transition.
- **Solution Stage (Anti-Byheart)**:
    - [ ] Verify Code starts **Blurred**.
    - [ ] Verify "View Code" button reveals text.
    - [ ] Verify "Good/Easy" buttons are **Disabled**.
    - [ ] Check "I can write this code" -> Verify buttons **Enable**.

## 3. SM-2 Algorithm & Scoring
- **Grading Logic**:
    - [ ] Grade "Again" (0) -> Verify Interval resets to 1 day.
    - [ ] Grade "Good" (4) -> Verify `RevisionCount` increases by +1.
    - [ ] Grade "Good" (4) -> Verify `NextReviewDate` is in the future.
- **Visual Feedback**:
    - [ ] Verify "Due" count decreases in header.
    - [ ] Verify "Brain Circuit" icon appears on card with correct count.

## 4. Analytics & Dashboard
- **Charts**:
    - [ ] Open "Mastery Metrics" / Dashboard.
    - [ ] Verify "Skill Radar" has data for the Topic used.
    - [ ] Verify "Recall Accuracy Trend" shows a point for Today.
- **Urgency List**:
    - [ ] Verify "Urgent Repairs" list updates if a problem is Due.
