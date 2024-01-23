import {
    ALL,
    ASSIGNED_TO_ME,
    ASSIGNED_TO_OTHERS,
    COMPLETE_TASK,
    COMPLETED_TASKS,
    CREATED_LAST_WEEK,
    CREATED_THIS_WEEK,
    CREATED_TODAY,
    CREATED_YESTERDAY, Filters,
    PENDING_TASKS, PRIORITY_TASKS,
    TASKS_FOR_ME
} from "../../../redux/Task/tasks/constants";

export const LeftSideBarData = [
    {
        title: "Filters",
        iconClass: "",
        id: Filters,
        path: "#",
        subNav: [
            {
                title: "All",
                iconClass: "fas fa-tasks",
                id: ALL,
                path: "#"
            },
            {
                title: "Active tasks",
                iconClass: "fas fa-hourglass-start",
                id: PENDING_TASKS,
                path: "#"
            },
            {
                title: "My tasks",
                iconClass: "fas fa-user",
                id: TASKS_FOR_ME,
                path: "#"
            },
            {
                title: "Tasks for others",
                iconClass: "fas fa-clipboard-list",
                id: ASSIGNED_TO_OTHERS,
                path: "#"
            },
            {
                title: "Priority tasks",
                iconClass: "fas fa-exclamation-circle",
                id: PRIORITY_TASKS,
                path: "#"
            },
            {
                title: "Completed tasks",
                iconClass: "far fa-calendar-check",
                id: COMPLETED_TASKS,
                path: "#"
            },
            {
                title: "Created today",
                iconClass: "fas fa-calendar-day",
                id: CREATED_TODAY,
                path: "#"
            },
            {
                title: "Created this week",
                iconClass: "far fa-calendar-alt",
                id: CREATED_THIS_WEEK,
                path: "#"
            },
            {
                title: "Created last week",
                iconClass: "far fa-calendar-alt",
                id: CREATED_LAST_WEEK,
                path: "#"
            }
        ]
    }
];