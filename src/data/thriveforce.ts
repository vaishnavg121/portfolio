export const thriveforceData = {
  team: "Team ThriveForce",
  roles: ["Engineer", "Treasurer"],
  disciplines: [
    "CAD Design",
    "Finite Element Analysis",
    "Fabrication",
    "Budgeting",
    "Procurement"
  ],
  robots: [
    {
      id: "velociraptor",
      name: "Velociraptor",
      weightClass: "3 lb / 1.36 kg",
      type: "Horizontal Undercutter",
      status: "Verified Build",
      specs: {
        energy: "~470 J",
        weaponMass: "0.297 kg",
        diameter: "140.6 mm",
        bite: "15.8 mm",
        material: "Hardened EN24 Steel"
      },
      powertrain: [
        { component: "Weapon Motor", spec: "DYS 3530 1100KV" },
        { component: "Weapon ESC", spec: "Hobbywing 50A" },
        { component: "Drive ESC", spec: "BLHeli-S" },
        { component: "Power", spec: "Scorpion 3S 1000mAh" },
        { component: "Transmission", spec: "1.7:1 Pulley Ratio" }
      ]
    },
    {
      id: "a7x",
      name: "A7X",
      weightClass: "8 kg",
      type: "Combat Robot",
      status: "Verified Legacy",
    },
    {
      id: "slipknut",
      name: "Slipknut",
      weightClass: "15 kg",
      type: "Combat Robot",
      status: "Verified Legacy",
    }
  ],
  sponsors: [
    { name: "PCBWay", verified: true },
    { name: "OnlyScrews", verified: true },
    { name: "Technobotix", verified: true }
  ],
  achievements: [
    { label: "Velociraptor Design & FEA Validation", year: "2024", verified: true },
    { label: "Sponsorship Procurement", year: "2023-2024", verified: true }
  ]
};
