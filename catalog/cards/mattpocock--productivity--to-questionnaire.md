---
id: mattpocock/productivity/to-questionnaire
src: raw_source/mattpocock/productivity/to-questionnaire/SKILL.md
sha: dadd0c00d6a350acaa15bb9ca1b96b20ead684ca
status: active
mechanism: interview the user only about the send (recipient, what is needed back), then emit a markdown questionnaire aimed at the knowledge gap
human_in_loop: true
subject: idea
cost: low
landmines: ["writes to the current working directory by default"]
concepts: [structured-interrogation]
---

Turns a decision the user cannot answer alone into a document someone else fills in. Two short interview steps - who is the recipient, and what do you need back - then it drafts the questionnaire and writes it to a file.

The idea worth stealing is 'grill the send, not the subject'. The user cannot answer questions about the subject, which is the whole reason the questionnaire exists, but they can always answer who it goes to and what they need back. So the interview targets what the user knows, and the document targets the gap between what the recipient knows and what the user needs. That inversion is the trick, and it generalises well beyond questionnaires to any handoff where the person in front of you is not the person with the answers.
