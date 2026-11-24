// Statement order is fixed on purpose (not shuffled per render), so server and client markup match.
export const truths = {
  title: "Two Truths",
  intro: "two truths and a lie. pick the lie.",
  lieTag: "the lie",
  right: "got it",
  wrong: "nope",
  others: "the other two are true.",
  next: "Next round",
  again: "Play again",
  rounds: [
    {
      label: "round 1: me",
      statements: [
        { text: "i got bitten by a monkey in cambodia", lie: false },
        { text: "i made friends with a monk and studied with him for a month", lie: true },
        { text: "i walked from cambodia to laos with a broken foot", lie: false },
      ],
    },
    {
      label: "round 2: work",
      statements: [
        { text: "i built my first website when i was 12", lie: true },
        {
          text: "i switched my degree so late i had to teach myself a-level physics and further maths in 6 months",
          lie: false,
        },
        { text: "i said no to jpmorgan to go and work in vietnam for 2 years", lie: false },
      ],
    },
  ],
};
