# ERPForge

## Thesis
- Traditional ERPs are built for the average business, not the actual one
- Long tail of small/mid-market manufacturers are underserved
- Claude + agentic frameworks make custom ERP development fast and cheap
- Small teams can now deliver what used to require large consulting engagements

## Target Customer
- Industry: Small/mid-market manufacturing (job shops, custom fabricators)
- Core pain: Managing BOMs and procurement without expensive ERP software
- Current alternatives: Spreadsheets, overpriced legacy systems, costly implementations (both time and money)

## What's Built (Proof of Concept)
### Manually Created Sample ERP
The manually created sample ERP was built to understand how to use agents to interview customers for product specs and then translate that into code. It helps me understand how agents can be improved both with better interviewing skills and development skills.
1. Software architecture determined via ChatGPT interviews (2 hrs)
    - Hosting via Railway and Cloudflare
    - UI Guidelines
    - Architecture
1. Using Claude Code to plan out the platform (2 hrs)
    - Given general guidance about a business
    - Plan mode used to refine business requirements
    - Plan created to develop the base level ERP
1. Claude Code Builds out a basic ERP (2 hrs)
    - Products/BOM management
    - Product routings
    - Inventory management
    - Ordering and chain workflow
    - Purchase order tracking
1. Moved ERP from local device to cloud (8 hrs)
    - Manual setup on Railway was harder than expected
    - I'm not used to setting up security measures on Cloudflare
1. Enhanced BOM Module via Claude Code and more advanced prompting (2 hrs)
    - Did more research on potential BOM variations to craft better planning questions
    - Re-ran plan mode in Claude Code
    - Built new BOM workflows
1. Added a help agent and user creation workflow (8 hrs)
    - Added user creation and demo workflow (clones from a demo dataset)
    - Prompts users on how to start on a page with no data (i.e. inventory has no instances)
    - AI help bot

## What's Next
### Layer 1 — Core ERP (current)
- Solidify BOM and procurement workflows
- Validate with real manufacturer contact

### Layer 2 — Customization Platform
- Let businesses configure workflows without code
- Industry-specific modules

### Layer 3 — Spec Automation
- Interview-driven requirements gathering
- Auto-generate specs and configurations from business inputs

## Interesting Angles / Talking Points
- How simple individual ERP workflows actually are
- Permutation problem: same workflows, different configurations per company
- Speed of development with Claude Code
- What this means for team size and consulting costs

## Open Questions / Exploring
- Which sandbox integration to demonstrate first (Shopify, Stripe, NetSuite?)
- How to structure the spec layer interviews
- Finding the right manufacturing use case to showcase

## Validation
- Manufacturer contact: [name/company]
- Status: [conversations started / in progress]