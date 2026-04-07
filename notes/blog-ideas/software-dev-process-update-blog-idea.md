# SaaS Software Development Process Update

This is a blog idea on how the SaaS software development process is changing

## Out of scope

- Before the 

## Existing Process

Because delivery is expensive we want to make sure we get the problem exactly right before we deliver.

### Product Planning and Research

#### Product Requirements

Goal: What should the software do?

Tools:
- Interviews with end users
    - What integrations do they need?
    - What should it accomplish?
    - Pain points
    - Use cases specific to their business
- Knowledge from previous projects
- Research on domain

#### Partnership Exploration

Goal: What tech could help solve the problem?

Tools:
- Explore adjacent integrations and/or software services
- What technology isn't being thought of or used but could help?

#### UX Insights

Goal: What kind of UX should be deployed?

Tools/artifacts:
- Previously used layouts
- Existing themes
- Best practices
- Customer preferences or tools they like

### Plan Software

Goals: Detailed plan on what to deliver

Tools/artifacts:
- Mockups to verify design
- PRD with specs devs can implement
- Rough roadmap of the plan

### Plan Validation

Goal: Get key stakeholders bought into the plan

Tools:
- Meetings or sign-offs to finalize the plan

### Engineering Plan

Goal: Engineering execution is outlined for devs to deliver on

Note: This may be continually updated as new findings emerge

Tools:
- Jira tickets
- Roadmap

### Software Delivery

Goal: Create the software

Components:
- Development
- QA
- Documentation
- Deployment

### Software Validation

Goal: verify the software meets the goals

- Monitor for bugs
- Gather feedback
- Update software as needed

## New process

Development is much cheaper via AI coding. AI can also help with the planning and research steps. All processes should include AI in the loop and be built to deliver functional code as a way to validate. Key decisions and insights need to be captured, but AI can help summarize the planning and reference a centralized repository of specs for use in coding, communicating functionality to users, and documenting processes for future updates.

### Requirements

#### Product Requirements

Change: AI now works side-by-side with product consultant. It gathers basic requirements and surfaces more nuanced insights to the product consultant. AI can take in multiple sources of info just as a product consultant would.
- Direct interviews with clients
- Scripts from human meetings
- Business artifacts (database schema, integration specs, logs, etc.)

#### Partnership Exploration

Change: AI helps validate partnership feasibility by understanding API specs and gaps.

#### UX Insights

Change: While insights don't change much, AI helps validate UX quicker by enabling rapid prototyping.

### Plan Software

Change: AI snthesizes the learnings from discovery and comes up with a plan which is then presented to customers and product consultant.

### Plan Validation

Change: Plan is a live artifact with translation layer that communicates it to needed parties.

### Engineering Plan

Change: Engineering planning goes from planning out detailed tasks to focusing on architectural decisions.

### Software Delivery

Change: AI creats code directly from the plan. Code is delivered faster and can be updated easier by updating the product requirements.

### Software Validation

Change: AI helps users understand the product and more efficiently surface product gaps.