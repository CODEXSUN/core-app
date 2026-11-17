import { useState } from "react";
import {
  Activity,
  MessageSquare,
  LogIn,
  Timer,
  ClipboardList,
} from "lucide-react";
import {
  FormAnimatedTabs,
  type FormTab,
} from "@workspace/ui/blocks/form-controls/animated-tabs";

const tabs: FormTab[] = [
  {
    value: "actions",
    label: "Actions",
    icon: <Activity />,
    count: 3,
    content: <p>Action records</p>,
  },
  {
    value: "comments",
    label: "Comments",
    icon: <MessageSquare />,
    count: 0,
    content: <p>No comments yet.</p>,
  },
  {
    value: "check",
    label: "Check in / out",
    icon: <LogIn />,
    count: 0,
    content: <p>No check-ins yet.</p>,
  },
  {
    value: "jobs",
    label: "Jobs",
    icon: <Timer />,
    count: 0,
    content: <p>No jobs yet.</p>,
  },
  {
    value: "charges",
    label: "Charges",
    icon: <ClipboardList />,
    count: 0,
    content: <p>No charges yet.</p>,
  },
];
export function AnimatedTabsExample() {
  const [tab, setTab] = useState("comments");
  return (
    <FormAnimatedTabs
      value={tab}
      onValueChange={setTab}
      label="Enquiry details"
      tabs={tabs}
    />
  );
}
// Required: tabs, value, onValueChange; label defaults to "Record details".
// Each tab requires value/label/content; icon and count are optional.
// This reference preview has five tabs. Apps provide relevant tab data.
// Arrow-key navigation is provided by Radix Tabs. Reduced motion disables
// underline animation. Scrollbar chrome is hidden; narrow strips scroll horizontally.
