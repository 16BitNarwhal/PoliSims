export interface Policy {
  id: string;
  title: string;
  description: string;
  status: 'In Progress' | 'Passed' | 'Failed';
  proposedDate: string;
  lastUpdated: string;
  sponsor: string;
  affectedIndustries: string[];
}

export const policies: Policy[] = [
  {
    id: "bill-226",
    title: "Bill 226, Fixing Tribunals Backlogs Act, 2024",
    description: "An Act to address and reduce the backlog in Ontario's administrative tribunals by implementing efficient case management systems and streamlining processes.",
    status: "In Progress",
    proposedDate: "2024-01-15",
    lastUpdated: "2024-02-01",
    sponsor: "MPP Sarah Johnson",
    affectedIndustries: ["Legal", "Government", "Housing"]
  },
  {
    id: "bill-225",
    title: "Bill 225, Resource Recovery and Circular Economy Amendment Act (Beverage Container Deposit Program), 2024",
    description: "An Act to establish a comprehensive deposit return program for beverage containers and promote recycling initiatives across Ontario.",
    status: "In Progress",
    proposedDate: "2024-01-10",
    lastUpdated: "2024-01-30",
    sponsor: "MPP Michael Chen",
    affectedIndustries: ["Retail", "Manufacturing", "Waste Management"]
  },
  {
    id: "bill-224",
    title: "Bill 224, Safer Driving Tests Act (Ending the Privatization Failure), 2024",
    description: "An Act to reform driver testing in Ontario by addressing issues with privatized testing centers and implementing standardized testing procedures.",
    status: "In Progress",
    proposedDate: "2024-01-05",
    lastUpdated: "2024-01-25",
    sponsor: "MPP David Wilson",
    affectedIndustries: ["Transportation", "Education", "Insurance"]
  },
  {
    id: "bill-223",
    title: "Bill 223, Safer Streets, Stronger Communities Act, 2024",
    description: "An Act to enhance community safety through improved urban planning, traffic calming measures, and pedestrian-friendly infrastructure.",
    status: "In Progress",
    proposedDate: "2024-01-01",
    lastUpdated: "2024-01-20",
    sponsor: "MPP Lisa Thompson",
    affectedIndustries: ["Construction", "Transportation", "Municipal Services"]
  },
  {
    id: "bill-222",
    title: "Bill 222, Heat Stress Act, 2024",
    description: "An Act to protect workers from extreme heat conditions by establishing maximum workplace temperature limits and mandatory rest periods.",
    status: "In Progress",
    proposedDate: "2023-12-20",
    lastUpdated: "2024-01-15",
    sponsor: "MPP Robert Brown",
    affectedIndustries: ["Construction", "Agriculture", "Manufacturing"]
  },
  {
    id: "bill-221",
    title: "Bill 221, Day of Reflection for Indian Residential Schools Act, 2024",
    description: "An Act to establish September 30 as a provincial statutory day of reflection to commemorate the history and legacy of Indian Residential Schools.",
    status: "In Progress",
    proposedDate: "2023-12-15",
    lastUpdated: "2024-01-10",
    sponsor: "MPP Jennifer Smith",
    affectedIndustries: ["Education", "Government", "Cultural Services"]
  }
];
