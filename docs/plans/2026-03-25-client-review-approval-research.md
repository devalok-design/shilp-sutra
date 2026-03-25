# Client Review & Approval Workflow Research

**Date:** 2026-03-25
**Context:** Karm by Devalok Design & Strategy Studios -- a PM tool where design/strategy agencies deliver work to clients who need low-friction review, comment, and approval flows.
**Scope:** 14 tools studied, concrete recommendation for Karm at the end.

---

## Tool-by-Tool Analysis

### 1. Frame.io (Adobe)

**Review Request Flow (Agency Side)**
- Upload asset, click "Request approval" on any asset's preview page
- Select specific files -- approval is per-asset, not batch
- Add approvers and/or reviewers (distinct roles: reviewers comment, approvers must decide)
- Context/instructions via description on the asset or accompanying comment
- Deadline: not natively on the review link itself, managed via connected Workfront
- Notification: email + in-app notification to approvers

**Review Experience (Client Side)**
- Client receives a Review Link -- a standalone URL, no Frame.io account required
- Focused review mode: full-screen viewer with annotation tools
- Approve/Needs Work/No Response -- three-state decision
- Pin comments on specific video timestamps or image regions; draw annotations directly on frames
- Cannot upload counter-proposals through review links
- No progress indicator for batch review (one asset at a time)
- Per-asset approval, not batch

**Revision Workflow**
- "Needs Work" decision triggers notification back to creator
- New version uploaded to the same asset slot; previous versions preserved
- Side-by-side version comparison (V1 vs V2)
- Threaded comments per timestamp/region persist across versions
- No explicit "Round 1 / Round 2" labeling -- versions serve as rounds

**Approval States & UI**
- Three states: Needs Review (orange dot), In Progress (blue), Approved (green checkmark)
- Color-coded dot/stamp on thumbnails in the asset browser
- Status lives on each asset, visible in grid/list views
- Approved assets are not locked -- can upload new versions

**Low-Friction Patterns**
- Review Links: no account, no login, just a URL
- Password-protect and set expiration on review links
- Commenting can be enabled/disabled per link
- Mobile-responsive review viewer
- Drawing annotations on video frames (very low barrier)
- No email-based approval (must visit the link)

**Multi-Stakeholder Review**
- Add multiple approvers per asset
- No formal "all must approve" / "majority" rules -- manual tracking
- Reviewer vs Approver distinction (reviewers don't block progress)
- Dashboard shows who has/hasn't responded

**Notifications & Reminders**
- Email on review request + in-app notification
- No automated reminder cadence (manual follow-up)
- Real-time notification when approver makes a decision

---

### 2. Filestage

**Review Request Flow (Agency Side)**
- Upload file to a project, add reviewers to the review step
- Can select specific files or entire project for review
- Add context via file description + due date per file
- Due dates with automated email reminders (2 days before through 5 days after)
- Notifications: email, Slack, Microsoft Teams

**Review Experience (Client Side)**
- No Filestage account required -- guest reviewers enter name + email only
- Focused proofing view: file viewer with markup tools
- Four-state decision: Approve / Approve with Changes / Request Changes / Reject
- Pin comments directly on files (images, PDFs, videos, documents)
- Markup tools: freehand draw, shapes, text annotations
- Cannot upload counter-proposals (comment-only)
- Dashboard shows review progress per reviewer
- Per-file approval decisions

**Revision Workflow**
- Upload new version to the same file slot
- Side-by-side version comparison with one click
- Comments carry forward; version history preserved
- Sequential or parallel review steps (e.g., internal review -> client review -> legal)
- Status dashboard shows which step each file is in

**Approval States & UI**
- Four states: Pending / Approved / Approved with Changes / Changes Requested / Rejected
- Color-coded status badges on file cards in the dashboard
- "Team only" comments for internal discussions invisible to clients
- No lock-after-approval -- new versions can always be uploaded

**Low-Friction Patterns**
- No account required for reviewers (name + email only)
- Automated due date reminders
- Simple decision buttons (approve/reject/changes)
- Mobile-friendly review interface
- Comments are contextual (pinned on the file, not separate)

**Multi-Stakeholder Review**
- Multiple reviewers per step, multiple steps per workflow
- Sequential (step 1 -> step 2) or parallel (all at once) review structures
- Dashboard: who approved, who hasn't, per step
- No formal "all must approve" rule -- implicit (you're waiting until everyone responds)

**Notifications & Reminders**
- Email on review request
- Automated reminders: 2 days before due date, daily after overdue
- Slack/Teams integration for notifications
- Email on new version upload

---

### 3. Monday.com

**Review Request Flow (Agency Side)**
- No native proofing -- relies on integrations (PageProof, Ziflow, GoProof)
- Status column + approval automation: move item to "Awaiting Approval" -> notify reviewer
- Can set up multi-stage approval with automations (e.g., "when status changes to X, notify Y")
- Deadline via date column
- Notification: email + in-app

**Review Experience (Client Side)**
- Native: client sees a board item with status column; no focused review mode
- With PageProof integration: client gets a proofing link with annotation tools
- Simple status change (Approved/Rejected) on the board item
- No native annotation/markup
- Progress tracking via board views and dashboards

**Revision Workflow**
- Manual: upload new file version to the item
- PageProof integration handles version comparison
- No native revision rounds

**Approval States & UI**
- Customizable status column with colored labels
- Typical: To Review / Approved / Changes Needed / Rejected
- Status colors customizable per board
- No lock behavior

**Low-Friction Patterns**
- Guest access via shareable board links (view or edit)
- Notification automations (email reminders)
- Mobile app for quick approvals
- But: client needs to understand Monday.com's board UI

**Multi-Stakeholder Review**
- AppFox "Approvals" add-on: single or multi-stage approval cycles
- Bulk approval templates
- Track who approved via people column

**Notifications & Reminders**
- Automation-driven: "when due date arrives, notify..."
- Email + in-app
- No built-in reminder cadence for approvals (must build with automations)

---

### 4. Asana (Proofing + Approvals)

**Review Request Flow (Agency Side)**
- Create an "Approval" task type (special task variant)
- Attach files to the task; assign an approver
- Proofing: upload image/PDF, add annotations directly in Asana
- Deadline via due date field
- Notification: email + in-app to the approver

**Review Experience (Client Side)**
- Approver sees the task with three buttons: Approve / Request Changes / Reject
- Proofing view: click on an image/PDF attachment -> annotation layer appears
- Pin comments on specific regions of images/PDFs
- No video annotation natively
- Per-task approval (not per-file within a task)

**Revision Workflow**
- "Request Changes" keeps the task incomplete and sends it back
- Upload new version of the file; version history in the attachment
- Comments on annotations persist
- No formal round tracking

**Approval States & UI**
- Three states: Approved (green check) / Changes Requested / Rejected
- Visual: special approval task icon (thumbs up) instead of normal checkbox
- Status reflected in task list with colored indicators
- Known issue: "Rejected" and "Changes Requested" behave like "completed" in some views

**Low-Friction Patterns**
- Guest access via project sharing
- Clean three-button approval UX
- Mobile app support
- But: requires Asana account to interact (no anonymous review)

**Multi-Stakeholder Review**
- Single approver per approval task (limitation)
- Workaround: create multiple approval subtasks
- No formal "all must approve" rules

**Notifications & Reminders**
- Email on assignment + due date reminders
- Follow-up reminders configurable in project settings

---

### 5. ClickUp (Proofing)

**Review Request Flow (Agency Side)**
- Attach image/PDF/video to a task, open proofing view
- Annotate: click anywhere on the file to pin a comment
- Assign task to reviewer; set due date
- Automations can route tasks through review stages
- Notification: email + in-app

**Review Experience (Client Side)**
- Click on attachment -> proofing overlay
- Click anywhere to place a comment pin
- Supports images (PNG, GIF, JPEG, WEBP), PDFs, videos (MP4, WEBM, Ogg)
- Comments posted to task activity feed
- No formal approve/reject buttons natively (use custom status or custom fields)
- External guests can access via shared link (limited ClickUp account)

**Revision Workflow**
- Upload new file version to the same attachment
- Version switching in proofing view
- Comments tied to specific versions
- No native revision round concept

**Approval States & UI**
- Custom status or custom field for approval state
- Automations: move to next status when approved
- No built-in approval task type like Asana

**Low-Friction Patterns**
- Proofing works within the task context (no separate tool)
- ClickUp Brain (AI) can summarize feedback threads
- Mobile app
- But: requires ClickUp familiarity; not a focused proofing experience

**Multi-Stakeholder Review**
- Multiple assignees
- Custom fields for tracking approval per person
- No formal approval rules engine

**Notifications & Reminders**
- Due date reminders
- @mentions in comments
- Automation-based notifications

---

### 6. Basecamp (Client Approvals)

**Review Request Flow (Agency Side)**
- Dedicated "Client Approval" feature on the Clientside
- Write up what needs approval, attach files/images, select which client contact
- Set a due date for the response
- Single-person approval request (one client contact per request)
- Notification: email to the client

**Review Experience (Client Side)**
- **THE GOLD STANDARD FOR SIMPLICITY**
- Client gets an email with a "View the request" button
- Lands on a focused page showing ONLY the request + attachments
- Two enormous buttons: "Yes, I approve" and "No, not yet"
- Can add a comment alongside their decision
- No account required -- responds from the email link
- No annotations, no markup, no complexity

**Revision Workflow**
- "No, not yet" response goes back into Basecamp
- Agency sees the denial + comment
- Post an updated version as a new approval request
- No version comparison, no formal rounds
- Simple back-and-forth through approval requests

**Approval States & UI**
- Three states: Waiting (pending) / Approved (Yes) / Denied (No, not yet)
- Request shows status inline with the response
- Very simple -- no color system or badges

**Low-Friction Patterns**
- **No login required**
- **Email-clickable** (one click from email -> decision page)
- **Binary decision** (Yes/No) -- zero ambiguity
- **Auto-reminders**: 24 hours before due date, then daily if overdue
- Can edit/cancel pending requests
- CC team members on the request

**Multi-Stakeholder Review**
- One client contact per approval request (limitation)
- Workaround: send multiple approval requests
- No "all must approve" rules -- each is independent

**Notifications & Reminders**
- Email on request creation
- Auto-reminder 24h before due date
- Daily auto-reminder when overdue
- Email notification on client response

---

### 7. Notion (Shared Pages)

**Review Request Flow (Agency Side)**
- Share a page with client as a guest (email invite)
- Client gets "Can Comment" permission
- No formal review request -- just share the page and @mention
- No due dates on review requests
- Notification: email invite + @mention notifications

**Review Experience (Client Side)**
- See the full Notion page (not a focused review mode)
- Leave comments on specific blocks or in the page discussion
- @mention team members in comments
- No annotation/markup tools
- No approve/reject buttons (just comments)
- Requires Notion account to comment

**Revision Workflow**
- Edit the page directly; version history tracked automatically
- No side-by-side comparison
- Comments resolve/unresolve
- No formal revision rounds

**Approval States & UI**
- No native approval states
- Workaround: database status property (custom)
- Community templates exist for approval tracking

**Low-Friction Patterns**
- Clean, readable page format
- Comments are contextual (on specific blocks)
- But: requires Notion account for commenting
- Not a proofing tool -- general-purpose wiki

**Multi-Stakeholder Review**
- Multiple guests can comment
- No approval rules
- No tracking of who reviewed

**Notifications & Reminders**
- Email on @mention
- No review-specific reminders

---

### 8. Figma (Sharing + Commenting)

**Review Request Flow (Agency Side)**
- Share file via "Share" button -> enter client email -> set permission (View/Comment)
- Or share a link with "anyone with the link" access
- Branch review: request review from collaborator before merging
- No formal approval request flow for external clients
- Notification: email invite + Figma notification

**Review Experience (Client Side)**
- Full design file view with pan/zoom
- Comment tool: click anywhere on the canvas to pin a comment
- @mention in comments
- Resolve comments when addressed
- No approve/reject buttons (just comment resolution)
- Can view without account; must have account to comment

**Revision Workflow**
- Version history with named milestones
- Compare versions by toggling version history
- Branch review: Approve or Suggest Changes (internal feature)
- Comments persist across versions

**Approval States & UI**
- No native approval states for external review
- Branch review: Approved / Changes Suggested (internal team feature)
- Comment resolved/unresolved as implicit approval

**Low-Friction Patterns**
- Can view designs without an account (view-only link)
- Commenting requires Figma account (friction)
- Pin comments directly on design elements
- Mobile-friendly viewer
- Plugins like Commentful add formal approval workflows

**Multi-Stakeholder Review**
- Multiple commenters on the same file
- Branch review supports multiple reviewers
- No formal "all must approve" rules for client review

**Notifications & Reminders**
- Email on comment/mention
- No automated reminder system

---

### 9. InVision (Legacy -- shutting down)

**Review Request Flow (Agency Side)**
- Share prototype via link to stakeholders
- Pin comments on specific screens/elements
- Status per screen: In Progress / Needs Review / Approved

**Review Experience (Client Side)**
- Navigate prototype interactively
- Pin comments on specific UI elements
- Per-screen status tracking
- Color-coded dots on screen thumbnails

**Revision Workflow**
- Upload new screen versions
- Comments persist per version
- Screen status reset on new upload

**Approval States & UI**
- Per-screen: No Status / In Progress / Needs Review / Approved
- Colored dots on thumbnails
- Single view of all screen statuses

**Low-Friction Patterns**
- Share link (no account needed for viewing)
- Commenting may require account
- Per-screen focused review

**Note:** InVision shut down its standalone product in late 2024. Included for pattern reference only.

---

### 10. Ziflow

**Review Request Flow (Agency Side)**
- Upload creative asset, create proof, add reviewers
- Custom workflow stages (e.g., Internal -> Client -> Legal)
- Add deadline, instructions, review criteria checklist
- Auto-route through stages
- Notification: email + integration (Slack/Teams/project tools)

**Review Experience (Client Side)**
- Secure review link with role-limited access (view / comment / approve)
- Rich markup: freehand, shapes, text, measure tool, across 1200+ file formats
- Three-state decision: Approve / Approve with Changes / Request Changes
- E-signature binding on decisions
- Progress indicator: see all reviewers and their status
- Per-asset approval

**Revision Workflow**
- New proof version auto-created from upload
- Side-by-side or overlay version comparison
- Comments per version, threaded
- ReviewAI (2025): automated checklist verification against review criteria
- Explicit round tracking via proof versions

**Approval States & UI**
- Pending / Approved / Approved with Changes / Changes Requested
- Color-coded reviewer status dots
- Final approval locks asset and generates audit report
- E-signature timestamp on approvals

**Low-Friction Patterns**
- Secure external links (no account needed, optional password)
- Simple three-button decision
- Automated reminders
- Mobile-friendly
- AI-assisted review (checklists)

**Multi-Stakeholder Review**
- Multiple reviewers per stage
- Sequential or parallel stages
- Dashboard: who approved, who pending
- Audit trail per reviewer

**Notifications & Reminders**
- Email on proof creation/new version
- Automated reminder cadence
- Integration-based notifications

---

### 11. ProofHub

**Review Request Flow (Agency Side)**
- Upload file to a task, open proofing view
- Add collaborators (internal or external guests)
- Markup tools: freehand, arrow, eraser, shapes
- Deadline via task due date
- Notification: email + in-app

**Review Experience (Client Side)**
- Guest access (no ProofHub login required for proofing)
- Annotate directly on images, GIFs, PDFs
- Threaded comments on annotations
- No formal approve/reject buttons in proofing (task status serves this)

**Revision Workflow**
- Multiple file versions stored; version history
- Compare with older versions
- Restore previous versions

**Approval States & UI**
- Task status column (custom stages)
- No dedicated approval state on proofing

**Low-Friction Patterns**
- Guest access for external reviewers
- Markup directly on files
- Threaded contextual comments

**Multi-Stakeholder Review**
- Multiple collaborators
- No formal approval rules

---

### 12. Bynder

**Review Request Flow (Agency Side)**
- Submit creative brief through Asset Workflow
- Assign reviewers/approvers per stage
- Workflow stages: Brief -> Creative -> Review -> Approval -> Published
- Notifications on stage transitions

**Review Experience (Client Side)**
- Annotation and commenting on assets within the DAM
- Approval decisions per asset
- AI agents (2025) for automated compliance/brand checks

**Revision Workflow**
- Version tracking within the DAM
- Comments per version
- Workflow stages drive revision flow

**Approval States & UI**
- Stage-based: each workflow stage has its own status
- Asset-level approval tracking

**Low-Friction Patterns**
- Enterprise-focused; requires Bynder access
- Not designed for external client review

**Multi-Stakeholder Review**
- Role-based approvers per stage
- Formal workflow routing

---

### 13. Wipster

**Review Request Flow (Agency Side)**
- Upload video/image/PDF/audio to a project folder
- Share via email (private) or public URL
- Feedback becomes tasks that can be checked off
- Track review status: NEW / REVIEWED / EDITING / APPROVED

**Review Experience (Client Side)**
- Timecode-specific comments on video
- Annotation tools
- Version comparison side-by-side
- Simple focused review interface

**Revision Workflow**
- Toggle between versions
- Feedback items become checkable tasks
- Status progression: NEW -> REVIEWED -> EDITING -> APPROVED

**Approval States & UI**
- Four states with clear labels
- Status visible on project dashboard

**Low-Friction Patterns**
- Public URL sharing (no account needed)
- Timecode comments (very precise)
- Feedback-as-tasks pattern (actionable)

**Multi-Stakeholder Review**
- Multiple reviewers
- Activity feed shows all reviewer activity

---

### 14. ReviewStudio

**Review Request Flow (Agency Side)**
- Create review, add files, invite reviewers (internal or guest)
- Unlimited workflow templates: define stages, approvers, deadlines, notification messages
- Automated reminders at intervals
- Notification: email on review creation

**Review Experience (Client Side)**
- Guest access with optional password (no account)
- Markup over 100+ formats (video, PDF, image, web, documents)
- Freehand, shapes, text annotations
- Approval decision per file
- Book view / continuous scroll for documents (2025)

**Revision Workflow**
- Version comparison: side-by-side with synced navigation + difference highlighter
- File versions auto-tracked
- Workflow stages define revision rounds

**Approval States & UI**
- Stage-based with customizable statuses
- Per-file approval tracking
- Dashboard overview of all reviews

**Low-Friction Patterns**
- Guest access (no account, optional password)
- Simple markup tools
- Automated reminders
- Mobile-friendly

**Multi-Stakeholder Review**
- Multiple reviewers per stage
- Workflow templates enforce review order
- Dashboard: who reviewed, who pending

---

## Cross-Tool Pattern Analysis

### What the Best Tools Get Right

| Pattern | Who Does It Best | Why It Matters |
|---------|-----------------|----------------|
| No account required | Frame.io, Filestage, Basecamp, ReviewStudio | Eliminates the #1 friction point for clients |
| Binary/ternary decision | Basecamp (Yes/No), Frame.io (Approve/Needs Work) | Decision fatigue kills review velocity |
| Per-deliverable approval | Frame.io, Filestage, Ziflow | Not "approve the whole task" -- approve each file |
| Pin comments on files | Frame.io, Filestage, ClickUp, Figma | Context > vague written feedback |
| Auto-reminders | Basecamp, Filestage, ReviewStudio | Clients forget; automated nudges are essential |
| Version comparison | Filestage, Ziflow, ReviewStudio, Wipster | "What changed?" is the first client question |
| Internal vs client comments | Filestage ("team only"), Karm (visibility) | Agency needs private discussion space |
| Focused review mode | Frame.io, Filestage, Basecamp | Don't overwhelm clients with PM UI |
| Feedback becomes tasks | Wipster | Close the loop: feedback -> action item |
| Review round tracking | Ziflow, ReviewStudio (via workflow stages) | "Are we on round 3 or 4?" should be obvious |

### What the Worst Tools Get Wrong

| Anti-Pattern | Who | Why It Fails |
|-------------|-----|-------------|
| Require full account | Notion, Figma (for comments), Asana | Client has to sign up, verify email, learn UI |
| No focused review mode | Monday.com, Notion | Client sees the full PM tool, gets overwhelmed |
| Single approver per task | Asana | Real projects have multiple stakeholders |
| No native proofing | Monday.com | Forces integration dependency |
| No automated reminders | Frame.io, Figma, Notion | Agency has to manually chase clients |
| Approval = task completion | Asana (rejected = completed) | Breaks filtering and follow-up workflows |

---

## The Winning Patterns (Ranked by Impact)

1. **Passwordless access** -- Magic link or review URL. Client clicks link in email, lands directly in review. No signup, no password.

2. **Focused review experience** -- Client sees ONLY the deliverables + context + decision buttons. Not the full task panel, not the board, not the project. A dedicated, clean review page.

3. **Per-deliverable decisions** -- Approve/Request Changes per file, not per task. "Logo: Approved. Website mockup: Needs changes." This is what agencies need.

4. **Simple ternary decision** -- Approve / Request Changes / (optional) Reject. Not a 5-option form. Three buttons max.

5. **Mandatory feedback on "Request Changes"** -- If they say "needs work," force them to say what. Otherwise the feedback is useless.

6. **Auto-reminders** -- 24h before due date, then daily. Basecamp's cadence is perfect.

7. **Version awareness** -- When V2 is submitted, client should see "V2 (updated)" and be able to compare with V1.

8. **Internal comments** -- Agency team discusses privately, then presents clean deliverables to client. Already in Karm.

9. **Progress tracking** -- "3 of 5 deliverables reviewed" visible to both sides.

10. **Audit trail** -- Who approved what, when, with what feedback. For dispute resolution.

---

## Concrete Recommendation for Karm

### Architecture: What to Build

Karm already has the backend primitives (the MCP tools reveal: `upload-deliverable`, `upload-new-version`, `request-review`, `approve-deliverable`, `request-revision` with feedback, `list-deliverables` with `reviewStatus` filter, `get-deliverable` with version history). The backend model is solid. What's missing is the **frontend workflow** in the TaskPanel.

### The Core Flow

```
Agency uploads deliverable(s) to task
        |
        v
Agency clicks "Request Review" (one click + optional message)
        |
        v
Client gets email with magic link to focused Review Page
        |
        v
Client reviews each deliverable: Approve or Request Changes (with required feedback)
        |
        v
Agency sees feedback in task timeline + deliverable status update
        |
        v
Agency uploads V2 -> "Request Review" again (same flow, version awareness)
```

### UI Design: Three Surfaces

#### Surface 1: Deliverables Section (Inside TaskPanel)

Lives between Subtasks and Timeline in the TaskPanel v3 unified scroll. This is the agency-side management surface.

```
+------------------------------------------+
|  Deliverables                     2 of 3  |
|  ---------------------------------------- |
|  [PDF] Brand Guidelines v2    APPROVED    |
|         Approved by Arjun -- 2d ago       |
|                                           |
|  [FIG] Homepage Mockup v3    CHANGES REQ  |
|         "Header needs more contrast"      |
|         -- Arjun, 1d ago                  |
|                                           |
|  [PDF] Content Strategy v1    PENDING     |
|         Awaiting review                   |
|                                           |
|  + Add deliverable                        |
|  [Request Review]  (primary button)       |
+------------------------------------------+
```

**Component: `TaskPanel.Deliverables`**

- Collapsible section header: "Deliverables" + progress badge ("2 of 3 approved")
- Each deliverable card: file type icon + title + version + status badge + latest feedback preview
- Click a deliverable -> opens the version history + comments in the review wing (280px)
- Staff: "Add deliverable" button (upload), "Request Review" button
- Client COLLABORATOR: sees deliverables, can approve/request changes inline
- Client VIEW_ONLY: sees deliverables + status, no actions

**Status badges (using existing Badge v2 component):**
- `DRAFT` -- `color="neutral"` -- grey
- `PENDING` -- `color="warning"` -- amber (waiting for review)
- `APPROVED` -- `color="success"` -- green
- `REVISION_REQUESTED` -- `color="error"` -- red
- `CHANGES_APPLIED` -- `color="accent"` -- blue (agency re-submitted, not yet re-reviewed)

#### Surface 2: Review Wing (280px Panel Wing)

When a deliverable is clicked in the Deliverables section, the review wing opens on the right (reuses the existing wing pattern from `task-panel-wings.tsx`). This is the detailed view for a single deliverable.

```
+----------------------------+
|  Homepage Mockup           |
|  v3 -- uploaded 1d ago     |
|  by Priya                  |
|                            |
|  [Preview thumbnail]       |
|  [Open file] [Download]    |
|                            |
|  --- Version History ---   |
|  v3  Mar 24  "Fixed header"|
|  v2  Mar 21  "Added hero"  |
|  v1  Mar 18  "Initial"     |
|                            |
|  --- Review Status ---     |
|  Arjun: Changes Requested  |
|  "Header needs more        |
|   contrast -- the logo     |
|   disappears on mobile"    |
|                            |
|  [Approve] [Request Changes]|
|  (client mode only)        |
+----------------------------+
```

**Component: `TaskPanelDeliverableCard` (in wing)**

- Deliverable title + current version + upload timestamp + uploader
- File preview thumbnail (if image) or file type icon (if document)
- Action buttons: Open (external link), Download
- Version history: vertical list, each entry = version number + date + change note
- Review status: who reviewed + their decision + feedback
- Client mode: Approve / Request Changes buttons at the bottom (Approve = `color="success"`, Request Changes = `color="error"` ghost that expands a textarea)

#### Surface 3: Focused Client Review Page (Full-Width Experience)

This is the **killer feature** -- a dedicated review page that the client lands on from the magic link email. NOT the task panel. NOT the board. A focused, standalone review experience.

```
+------------------------------------------------------------------+
|  [Devalok logo]                           [project name]          |
|                                                                   |
|  Review Request from Priya                                        |
|  "Please review the updated homepage and brand guidelines"        |
|  Due: March 28, 2026                                              |
|                                                                   |
|  ================================== Progress: 1 of 3 reviewed === |
|                                                                   |
|  +---------------------------+  +---------------------------+     |
|  | [PDF] Brand Guidelines v2 |  | [FIG] Homepage Mockup v3  |     |
|  |                           |  |                           |     |
|  | [preview thumbnail]       |  | [preview thumbnail]       |     |
|  |                           |  |                           |     |
|  | [Open] [Download]         |  | [Open] [Download]         |     |
|  |                           |  |                           |     |
|  | [v] APPROVED              |  | [ ] Not yet reviewed      |     |
|  +---------------------------+  +---------------------------+     |
|                                                                   |
|  +---------------------------+                                    |
|  | [PDF] Content Strategy v1 |                                    |
|  |                           |                                    |
|  | [preview thumbnail]       |                                    |
|  |                           |                                    |
|  | [Open] [Download]         |                                    |
|  |                           |                                    |
|  | [ ] Not yet reviewed      |                                    |
|  +---------------------------+                                    |
|                                                                   |
|  Each card, when expanded/clicked:                                |
|  +-----------------------------------------------------------+   |
|  |  Homepage Mockup v3                                        |   |
|  |  [Large preview / embedded viewer]                         |   |
|  |                                                            |   |
|  |  Previous version: v2 (Mar 21) -- [Compare versions]      |   |
|  |                                                            |   |
|  |  +------------------+  +------------------------+         |   |
|  |  | [v] Approve      |  | [!] Request Changes    |         |   |
|  |  +------------------+  +------------------------+         |   |
|  |                                                            |   |
|  |  (On "Request Changes", textarea expands:)                 |   |
|  |  +----------------------------------------------------+   |   |
|  |  | What needs to change?                               |   |   |
|  |  |                                                     |   |   |
|  |  +----------------------------------------------------+   |   |
|  |  [Submit feedback]                                         |   |
|  +-----------------------------------------------------------+   |
|                                                                   |
|  ================================================================ |
|  [Submit All Decisions]  (enabled when all items have a decision)  |
+------------------------------------------------------------------+
```

**Key design decisions for the Review Page:**

1. **Magic link access** -- Client clicks link in email, lands here. No login. Token-based auth.
2. **Scoped to one review request** -- Shows only the deliverables in this review, not the full task
3. **Progress bar** -- "2 of 3 reviewed" with visual progress
4. **Per-deliverable decisions** -- Approve or Request Changes on each item independently
5. **Required feedback on "Request Changes"** -- Textarea is mandatory (Wipster pattern)
6. **Version context** -- If this is V2+, show "Previous: v1" with link to compare
7. **Submit All** -- One final button to confirm all decisions (prevents accidental partial reviews)
8. **Agency context message** -- Show the review instructions from the agency at the top
9. **Due date** -- Visible at the top, becomes red when overdue
10. **Devalok branding** -- Logo + clean design, not a generic PM tool UI

### Request Review Flow (Agency Side)

When agency clicks "Request Review" in the Deliverables section:

```
+------------------------------------------+
|  Request Review                           |
|                                           |
|  Select deliverables:                     |
|  [x] Brand Guidelines v2                 |
|  [x] Homepage Mockup v3                  |
|  [ ] Content Strategy v1 (draft)          |
|                                           |
|  Send to:                                 |
|  [Arjun Patel (client)]  [+ Add]          |
|                                           |
|  Message (optional):                      |
|  "Please review the updated homepage      |
|   mockup. We addressed your feedback on   |
|   the header contrast."                   |
|                                           |
|  Due date: [Mar 28, 2026]                 |
|                                           |
|  [Send Review Request]                    |
+------------------------------------------+
```

This opens as a popover or a modal from the TaskPanel. It's a focused form, not a full page.

**Implementation:** Uses existing `request-review` MCP endpoint. The popover:
- Lists deliverables attached to the task (checkbox per deliverable)
- Client picker (from task members with CLIENT type)
- Optional message textarea
- Due date picker (reuses TaskDatePicker)
- Single "Send" button

### Revision Workflow

When a client requests changes:
1. A `review-event` timeline entry is posted: "Arjun requested changes on Homepage Mockup v3"
2. The feedback text is attached to the timeline entry (and stored on the deliverable)
3. The deliverable status changes to `REVISION_REQUESTED`
4. The Deliverables section shows the feedback preview under the deliverable card
5. Agency uploads a new version -> status changes to `CHANGES_APPLIED` (visually: "Re-submitted")
6. Agency clicks "Request Review" again -> new review round begins

**Version comparison:** When a deliverable has multiple versions:
- Review wing shows version history with change notes
- "Compare with previous" link opens both file URLs (for now -- no inline diff for V1)
- Timeline shows which versions were reviewed and what the decisions were

### Notification Strategy

| Event | Client Notification | Agency Notification |
|-------|-------------------|-------------------|
| Review requested | Email with magic link + in-app | In-app confirmation |
| Reminder (24h before due) | Email | None |
| Reminder (daily when overdue) | Email | "Review overdue" banner in Deliverables section |
| Client approves deliverable | None | Email + in-app + timeline event |
| Client requests changes | None | Email + in-app + timeline event with feedback |
| Agency uploads new version | Email "New version available" | In-app confirmation |
| All deliverables approved | Email "All approved!" summary | Email + in-app + celebration moment |

### Data Model Extensions

```typescript
// Add to TaskPanelTask
deliverables?: Deliverable[]

// New types
interface Deliverable {
  id: string
  title: string
  currentVersion: DeliverableVersion
  versions: DeliverableVersion[]
  reviewStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REVISION_REQUESTED' | 'CHANGES_APPLIED'
  latestFeedback?: {
    reviewerName: string
    reviewerId: string
    feedback: string
    timestamp: string
  }
  isClientVisible: boolean
  taskId: string
}

interface DeliverableVersion {
  id: string
  versionNumber: number
  fileUrl: string
  downloadUrl: string
  fileType: string  // 'PDF' | 'IMAGE' | 'FIGMA' | 'VIDEO' | etc.
  changeNote?: string
  uploadedBy: { id: string; name: string; image?: string | null }
  createdAt: string
}

// New context callbacks
onUploadDeliverable: (file: File, title: string, changeNote?: string) => void
onUploadNewVersion: (deliverableId: string, file: File, changeNote?: string) => void
onRequestReview: (deliverableIds: string[], clientIds: string[], message?: string, dueDate?: Date) => void
onApproveDeliverable: (deliverableId: string) => void
onRequestRevision: (deliverableId: string, feedback: string) => void
```

### Component File Structure

```
packages/karm/src/tasks/v3/
  task-panel-deliverables.tsx       -- Deliverables section (between subtasks and timeline)
  task-panel-wing-deliverable.tsx   -- Single deliverable detail wing (280px)
  task-panel-review-request.tsx     -- "Request Review" popover/modal form

packages/karm/src/client/
  client-review-page.tsx            -- Focused full-page client review experience
  client-review-card.tsx            -- Per-deliverable card with approve/changes buttons
  client-review-progress.tsx        -- Progress bar ("2 of 3 reviewed")
```

### What NOT to Build (Yet)

1. **Inline file annotation/markup** -- Frame.io and Filestage are best-in-class here; Karm is a PM tool, not a proofing tool. Link out to the file for detailed review. Phase 2: embed a lightweight image annotation layer.
2. **AI-assisted review checklists** -- Ziflow's ReviewAI is compelling but complex. Phase 2.
3. **E-signatures** -- Ziflow pattern. Only needed for enterprise/legal. Phase 3.
4. **Side-by-side version diff viewer** -- Requires significant rendering infrastructure. Phase 2.
5. **Email-based approval** -- Basecamp's "reply to approve" is clever but technically complex (inbound email parsing). Phase 2 -- for now, magic link is sufficient.
6. **Batch approval across tasks** -- "Approve all pending deliverables across project" -- useful but crosses the per-task boundary. Phase 3.

### Implementation Priority

**Phase 1 (Core -- ship this first):**
1. `TaskPanel.Deliverables` section in the unified scroll
2. Deliverable status badges (DRAFT/PENDING/APPROVED/REVISION_REQUESTED)
3. "Request Review" popover (select deliverables, pick client, add message, set due date)
4. Review wing showing single deliverable detail + version history
5. Client-side approve/request-changes buttons (inline in wing and in deliverables section for client mode)
6. Timeline events for review actions

**Phase 2 (Client Review Page -- the magic):**
7. Focused client review page (standalone route, magic link access)
8. Per-deliverable decision cards with progress indicator
9. Email notifications with magic links
10. Auto-reminder system (24h before, daily overdue)

**Phase 3 (Polish):**
11. Version comparison (side-by-side file view)
12. Lightweight image annotation (pin comments on images)
13. "All approved" celebration animation
14. Review analytics (time-to-approve, average rounds)

---

## Summary

The best review tools share three principles: **reduce client friction** (no account, focused UI, simple decisions), **give agencies visibility** (who approved, who hasn't, what feedback), and **track the conversation** (version history, threaded feedback, audit trail).

Karm's advantage is that it already has the backend model and the task panel infrastructure. The gap is purely in the frontend workflow: a Deliverables section in the TaskPanel, a review wing for detail, a request-review form, and most importantly, a focused client review page accessed via magic link.

The single highest-impact feature is the **focused client review page with magic link access**. This is what separates a PM tool from a review tool. Basecamp proved that simplicity wins -- but Basecamp only supports Yes/No per request. Karm should combine Basecamp's simplicity (magic link, focused page, auto-reminders) with Filestage's granularity (per-deliverable decisions, required feedback on changes, version awareness).
