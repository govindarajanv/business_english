// Curated library of US Business English conversational & email phrases.
// Each entry: { id, phrase, meaning, category }
// Categories are the sub-sections shown as collapsible groups in the
// "Conversational & Email phrases" section.
// Sources: Talaera (150+), Mailchimp, Language Matters (UK), Loora — normalized to US English.

export const EMAIL_PHRASES = [
  // ============================== Email Openings ==============================
  { id: 'email-hope-finds-well', phrase: 'I hope this email finds you well', meaning: 'A polite, friendly opening line for formal or semi-formal emails.', category: 'Email Openings' },
  { id: 'email-hope-week-well', phrase: "I hope your week is going well", meaning: 'A warm small-talk opener before getting to business.', category: 'Email Openings' },
  { id: 'email-writing-to', phrase: 'I am writing to request / confirm / check / inform you about...', meaning: 'States the purpose of the email up front.', category: 'Email Openings' },
  { id: 'email-writing-regarding', phrase: 'I am writing regarding / with regard to...', meaning: 'Professional way to reference the topic of the email.', category: 'Email Openings' },
  { id: 'email-quick-note', phrase: 'This is just a quick note to...', meaning: 'Casual opener for a short, informal message.', category: 'Email Openings' },
  { id: 'email-quick-reminder', phrase: 'This is just a quick reminder that...', meaning: 'A friendly, low-pressure reminder about something.', category: 'Email Openings' },
  { id: 'email-thanks-email', phrase: 'Thank you for your email about...', meaning: 'Acknowledges an incoming email and states the subject.', category: 'Email Openings' },
  { id: 'email-thanks-quick-reply', phrase: 'Thanks for your quick reply', meaning: 'Warm acknowledgment of a fast response.', category: 'Email Openings' },
  { id: 'email-reaching-out', phrase: 'Thank you for reaching out', meaning: 'Acknowledges that the other person contacted you first.', category: 'Email Openings' },
  { id: 'email-sorry-late-reply', phrase: "Sorry for the late reply", meaning: 'Politely apologizes for a delayed response.', category: 'Email Openings' },

  // ============================ Making Requests ============================
  { id: 'req-could-you-please', phrase: 'Could you please...?', meaning: 'A clear but polite way to ask for something.', category: 'Making Requests' },
  { id: 'req-could-you-possibly', phrase: 'Could you possibly tell me...?', meaning: 'A very polite, soft way to request information.', category: 'Making Requests' },
  { id: 'req-would-you-mind', phrase: 'Would you mind sharing your thoughts on...?', meaning: 'Polite request for input or feedback.', category: 'Making Requests' },
  { id: 'req-appreciate-if', phrase: "I'd really appreciate it if you could...", meaning: 'A courteous request that shows gratitude in advance.', category: 'Making Requests' },
  { id: 'req-grateful-if', phrase: 'I would be very grateful if you could...', meaning: 'A formal, polite request.', category: 'Making Requests' },
  { id: 'req-wondering-if', phrase: 'I was wondering if you could...', meaning: 'A gentle, indirect request.', category: 'Making Requests' },
  { id: 'req-helpful-if', phrase: 'It would be very helpful if you could send us...', meaning: 'Reframes a request around its usefulness to your work.', category: 'Making Requests' },
  { id: 'req-possible-call', phrase: 'Would it be possible to schedule a brief call this week?', meaning: 'Politely proposes a meeting or call.', category: 'Making Requests' },

  // ============================== Following Up ==============================
  { id: 'fu-checking-in', phrase: "Just checking in to see if you've had a chance to review my email", meaning: 'A gentle follow-up that does not sound pushy.', category: 'Following Up' },
  { id: 'fu-circle-back', phrase: 'I wanted to circle back on our conversation about...', meaning: 'Returns to an earlier topic in a follow-up.', category: 'Following Up' },
  { id: 'fu-following-up-request', phrase: "I'm following up on the request below", meaning: 'Nudges the reader toward an earlier pending request.', category: 'Following Up' },
  { id: 'fu-friendly-reminder', phrase: 'Just a friendly reminder about...', meaning: 'Politely reminds someone about a detail or deadline.', category: 'Following Up' },
  { id: 'fu-touching-base', phrase: 'Touching base on this — has there been any progress?', meaning: 'Checks on progress without being demanding.', category: 'Following Up' },
  { id: 'fu-havent-heard', phrase: "I'm following up as I haven't heard back yet", meaning: 'Follows up after getting no response.', category: 'Following Up' },
  { id: 'fu-time-sensitive', phrase: "This is time-sensitive, so I'd appreciate your response by [date]", meaning: 'Signals urgency and asks for a prompt reply.', category: 'Following Up' },

  // ===================== Email Closings & Sign-offs =====================
  { id: 'close-looking-forward', phrase: 'Looking forward to hearing from you soon', meaning: 'Invites a reply and closes on a positive note.', category: 'Email Closings' },
  { id: 'close-appreciate-feedback', phrase: 'Any feedback you can give me on this would be appreciated', meaning: 'Invites input on a document or proposal.', category: 'Email Closings' },
  { id: 'close-let-me-know-questions', phrase: 'Please let me know if you have any questions', meaning: 'A standard, open-ended polite closer.', category: 'Email Closings' },
  { id: 'close-in-advance', phrase: 'Thank you in advance', meaning: 'Thanks the reader before they act.', category: 'Email Closings' },
  { id: 'close-best-regards', phrase: 'Best regards', meaning: 'A safe, professional sign-off.', category: 'Email Closings' },
  { id: 'close-kind-regards', phrase: 'Kind regards', meaning: 'A warmer formal sign-off.', category: 'Email Closings' },
  { id: 'close-all-the-best', phrase: 'All the best', meaning: 'A friendly, semi-formal sign-off.', category: 'Email Closings' },
  { id: 'close-warm-regards', phrase: 'Warm regards', meaning: 'A warm but professional sign-off.', category: 'Email Closings' },
  { id: 'close-have-great-weekend', phrase: 'Have a great weekend', meaning: 'A friendly, personal closing note.', category: 'Email Closings' },

  // ======================== Apologies & Delays ========================
  { id: 'apol-late-response', phrase: 'I apologize for the late response', meaning: 'A concise apology for a delayed reply.', category: 'Apologies & Delays' },
  { id: 'apol-delay-get-back', phrase: "Sorry it took me so long to get back to you", meaning: 'Apologizes for a slow follow-up.', category: 'Apologies & Delays' },
  { id: 'apol-any-inconvenience', phrase: 'Please accept our apologies for any inconvenience caused', meaning: 'A formal apology for trouble caused.', category: 'Apologies & Delays' },
  { id: 'apol-confusion', phrase: 'Sorry for the confusion earlier', meaning: 'A quick apology for a mix-up or misunderstanding.', category: 'Apologies & Delays' },
  { id: 'apol-delay-in-getting-back', phrase: 'I apologize for the delay in getting back to you', meaning: 'A polite apology for not replying sooner.', category: 'Apologies & Delays' },
  { id: 'apol-thanks-patience', phrase: 'Thank you for your patience', meaning: 'Gratitude offered after a delay or long wait.', category: 'Apologies & Delays' },

  // ============================== Bad News ==============================
  { id: 'bad-unfortunately', phrase: 'Unfortunately, we are unable to...', meaning: 'Softens bad news with a polite lead-in.', category: 'Bad News' },
  { id: 'bad-afraid-not-possible', phrase: "I'm afraid it will not be possible to...", meaning: 'Delivers disappointing news gently.', category: 'Bad News' },
  { id: 'bad-regret-inform', phrase: 'We regret to inform you that...', meaning: 'A formal way to deliver bad news.', category: 'Bad News' },
  { id: 'bad-careful-consideration', phrase: 'After careful consideration, we have decided...', meaning: 'Shows the decision was deliberate and thoughtful.', category: 'Bad News' },
  { id: 'bad-out-of-my-hands', phrase: "I'm sorry but it's out of my hands", meaning: 'Explains that a decision is beyond your control.', category: 'Bad News' },
  { id: 'bad-company-policy', phrase: "It's against company policy to...", meaning: 'Gives a rules-based reason for declining.', category: 'Bad News' },

  // ====================== Clarifying & Confirming ======================
  { id: 'clar-could-you-clarify', phrase: 'Could you please clarify...?', meaning: 'Asks for clear clarification.', category: 'Clarifying & Confirming' },
  { id: 'clar-what-mean', phrase: 'What exactly do you mean by...?', meaning: 'Zeroes in on an unclear term.', category: 'Clarifying & Confirming' },
  { id: 'clar-explain-prefer-slow', phrase: 'Could you explain that again, please?', meaning: 'Requests a simpler or repeated explanation.', category: 'Clarifying & Confirming' },
  { id: 'clar-heard-correctly', phrase: "If I understood you correctly, you would like me to...", meaning: 'Checks that you captured a request correctly.', category: 'Clarifying & Confirming' },
  { id: 'clar-in-other-words', phrase: 'In other words, would you like us to...?', meaning: 'Repeats an idea in simpler terms to confirm.', category: 'Clarifying & Confirming' },
  { id: 'conf-just-to-confirm', phrase: 'Just to confirm, we are meeting at [time]...', meaning: 'Verifies the details of an arrangement.', category: 'Clarifying & Confirming' },
  { id: 'conf-as-we-agreed', phrase: 'As we agreed, we will proceed with...', meaning: 'Confirms a decision and next steps.', category: 'Clarifying & Confirming' },

  // ====================== Sharing Information ======================
  { id: 'info-please-note', phrase: 'Please note that...', meaning: 'Flags an important piece of information.', category: 'Sharing Information' },
  { id: 'info-find-attached', phrase: 'Please find the [file] attached', meaning: 'Tells the reader what is attached.', category: 'Sharing Information' },
  { id: 'info-see-below-details', phrase: 'Please see the information below for more details', meaning: 'Directs the reader to content in the body.', category: 'Sharing Information' },
  { id: 'info-here-is-document', phrase: "Here's the document you asked for", meaning: 'Delivers a requested attachment or item.', category: 'Sharing Information' },
  { id: 'info-quick-update', phrase: "Here's a quick update on the project", meaning: 'Opens a short status update.', category: 'Sharing Information' },
  { id: 'info-inform-you', phrase: "I'd like to inform you that...", meaning: 'States something you want the reader to know.', category: 'Sharing Information' },

  // ====================== Thanking & Appreciation ======================
  { id: 'thank-let-me-know', phrase: 'Thank you for letting me know', meaning: 'Acknowledges information you received.', category: 'Thanking & Appreciation' },
  { id: 'thank-heads-up', phrase: 'Thanks for the heads up', meaning: 'Gratitude for an advance warning.', category: 'Thanking & Appreciation' },
  { id: 'thank-keeping-in-loop', phrase: 'Thanks for keeping me in the loop', meaning: 'Appreciates being kept informed.', category: 'Thanking & Appreciation' },
  { id: 'thank-quick-response', phrase: "I really appreciate your quick response", meaning: 'Warm thanks for a fast answer.', category: 'Thanking & Appreciation' },
  { id: 'thank-detailed-feedback', phrase: 'Thank you for taking the time to provide such detailed feedback', meaning: 'Acknowledges thorough feedback.', category: 'Thanking & Appreciation' },
  { id: 'thank-patience', phrase: 'I appreciate your patience as we worked through these challenges', meaning: 'Validation and thanks for patience.', category: 'Thanking & Appreciation' },

  // ====================== Scheduling & Meetings ======================
  { id: 'sched-schedule-meeting', phrase: "I'd like to schedule a meeting on [day] if you are available", meaning: 'Proposes a meeting time.', category: 'Scheduling & Meetings' },
  { id: 'sched-available-on', phrase: 'I am available on [day], if that is convenient for you', meaning: 'Offers your availability.', category: 'Scheduling & Meetings' },
  { id: 'sched-can-you-make', phrase: 'Can you make it on [day]?', meaning: 'Checks if a proposed time works.', category: 'Scheduling & Meetings' },
  { id: 'sched-reschedule', phrase: "I'm afraid we need to reschedule our meeting", meaning: 'Politely postpones a planned meeting.', category: 'Scheduling & Meetings' },
  { id: 'meet-lets-get-started', phrase: "Let's get started", meaning: 'Signal that the meeting is officially underway.', category: 'Scheduling & Meetings' },
  { id: 'meet-what-next-step', phrase: "What's our next step?", meaning: 'Confirms the action items before closing.', category: 'Scheduling & Meetings' },

  // ========================= Meeting Talk =========================
  { id: 'talk-let-me-add', phrase: "I'd like to add...", meaning: 'Joins a discussion smoothly and politely.', category: 'Meeting Talk' },
  { id: 'talk-thanks-input', phrase: 'Thanks for your input', meaning: 'Shows appreciation for someone contribution.', category: 'Meeting Talk' },
  { id: 'talk-cover-points', phrase: "Today, I'll cover three main points", meaning: 'Sets the agenda for a presentation.', category: 'Meeting Talk' },
  { id: 'talk-meet-halfway', phrase: 'Can we meet halfway on this?', meaning: 'Invites a compromise.', category: 'Meeting Talk' },
  { id: 'talk-welcome-aboard', phrase: 'Welcome aboard!', meaning: 'Warmly greets a new team member or client.', category: 'Meeting Talk' },
  { id: 'talk-stay-in-touch', phrase: "Let's stay in touch", meaning: 'Keeps a professional relationship open.', category: 'Meeting Talk' },
];
