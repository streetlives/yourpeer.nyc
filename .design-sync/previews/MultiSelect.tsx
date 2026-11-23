import { MultiSelect } from "yourpeer.nyc-nextjs";

const services = [
  { label: "Food pantry", value: "food-pantry" },
  { label: "Soup kitchen", value: "soup-kitchen" },
  { label: "Clothing", value: "clothing" },
  { label: "Showers", value: "showers" },
];

export const WithSelection = () => (
  <div className="w-80">
    <p className="mb-2 text-black font-semibold text-sm">Which services did you use?</p>
    <MultiSelect
      options={services}
      defaultValue={["food-pantry", "soup-kitchen"]}
      onValueChange={() => {}}
      placeholder="Select services"
    />
  </div>
);

export const Empty = () => (
  <div className="w-80">
    <p className="mb-2 text-black font-semibold text-sm">Which services did you use?</p>
    <MultiSelect options={services} onValueChange={() => {}} placeholder="Select services" />
  </div>
);
