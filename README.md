# Lab Execution

- Input "Lab Order".
  - Handle the order decomposition into jobs.
  - Use templates or start from scratch, create your own templates.
  - Define dependencies manually or from templates.
  - Check for resources.
  - Define the parameters of the jobs.
  - Define the priority of the jobs.
  - Get an estimate?

- Check/Edit/Update the lab order status
  - Change parameters/priority/dependencies of the jobs.
  - Cancel jobs

- Create tasks from the jobs in the queue.

We will have 2 Queues:

- Waiting Queue: jobs that are waiting for some condition to be met (e.g., resource availability, dependencies, etc.)
- Review Queue: jobs that are waiting for review/approval before they can be executed.
- Ready Queue: jobs that are ready to be executed.

## TODO

- CMS Forms for creating/editing lab orders, jobs, tasks, etc.
- Simple table for those
- Node View

## Entities

- Resource Type
- Resource
- User
- Job - An atomic unit of work that needs to be done.
- Parameter - Attribute of the job.
- Task - A batch of jobs that are executed at the same time.

## Users

Internal use, the clients won't use it directly.

## Flows

- Production (Client orders)
- Research

## Extras

- Audit - each action (modification, creation, deletion) is logged with the user and timestamp.
- Notifications - users are notified of changes in the status of their orders (maybe use some Calendar API)
- Write protection (don't write if somebody modified the entity since you last read it)
- LLM integration - use LLMs to assist in job decomposition, parameter estimation, etc.
- RBAC - Role-Based Access Control, define roles and permissions for users.
- Integration with other systems - e.g., inventory management, billing, etc.
