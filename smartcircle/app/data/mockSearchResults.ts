import { SearchResults } from '../types/searchResults';
import { mockConnections } from './mockConnections';

export function generateMockSearchResults(task: string): SearchResults {
  // Select 10 relevant candidates based on the task
  const selectedConnections = mockConnections
    .map((conn, index) => ({
      ...conn,
      id: (index + 1).toString(),
    }))
    .slice(0, 10);

  // Generate candidates with reasoning and outreach messages
  const candidates = selectedConnections.map((connection) => {
    // Generate reasoning based on profession and task
    const reasoning = generateReasoning(connection, task);

    // Generate personalized outreach message
    const outreachMessage = generateOutreachMessage(connection, task);

    return {
      connection_id: connection.id,
      reasoning,
      outreachMessage,
    };
  });

  return {
    task,
    candidates,
    timestamp: new Date(),
  };
}

function generateReasoning(connection: any, task: string): string {
  const reasoningTemplates = [
    `${connection.name} has extensive experience in ${connection.profession.toLowerCase()}, making them highly relevant for your needs. Their background in ${connection.location} gives them valuable market insights. With a closeness score of ${connection.closeness}/10, you have a strong existing relationship to leverage.`,

    `Based on their role as ${connection.profession}, ${connection.name} possesses the exact skill set you're looking for. They're based in ${connection.location}, which could be strategically valuable. Your relationship strength (${connection.closeness}/10) suggests they'd be receptive to this opportunity.`,

    `${connection.name}'s expertise in ${connection.profession.toLowerCase()} aligns perfectly with your request. Their professional network in ${connection.location} could open additional doors. Given your closeness rating of ${connection.closeness}/10, they're likely to be enthusiastic about collaborating.`,

    `With a background in ${connection.profession.toLowerCase()}, ${connection.name} brings relevant domain knowledge. Their location in ${connection.location} provides geographical advantages. Your established relationship (${connection.closeness}/10 closeness) makes this a natural fit.`,

    `${connection.name} stands out due to their ${connection.profession.toLowerCase()} experience and proven track record. Being in ${connection.location} offers unique positioning. Your strong connection (${connection.closeness}/10) increases the likelihood of a positive response.`,
  ];

  // Rotate through templates
  const index = Math.abs(connection.name.charCodeAt(0)) % reasoningTemplates.length;
  return reasoningTemplates[index];
}

function generateOutreachMessage(connection: any, task: string): string {
  const firstName = connection.name.split(' ')[0];

  const messageTemplates = [
    `Hey ${firstName}! 👋

I hope you're doing well! I've been working on something exciting and immediately thought of you.

${task}

Given your background in ${connection.profession.toLowerCase()}, I think you'd be perfect for this. Would love to catch up and discuss this opportunity if you're interested!

When are you free for a quick chat?`,

    `Hi ${firstName}!

Long time no talk! I'm reaching out because I have an opportunity that seems right up your alley.

I'm looking for help with: ${task.toLowerCase()}

Your expertise in ${connection.profession.toLowerCase()} makes you an ideal fit. Would you be open to exploring this together?

Let me know if you'd like to learn more!`,

    `Hey ${firstName},

Hope things are going great with you! I wanted to reach out about something I'm working on.

The project: ${task.toLowerCase()}

With your experience as ${connection.profession}, you'd bring exactly what we need. Interested in chatting about it?

Coffee soon? ☕`,

    `Hi ${firstName}!

I've been thinking about who would be perfect for something I'm working on, and you came to mind immediately.

What I need: ${task.toLowerCase()}

Your skills in ${connection.profession.toLowerCase()} would be invaluable. Any chance you'd want to explore this opportunity?

Let me know what you think!`,

    `Hey ${firstName},

How have you been? I'm working on an exciting project and would love your involvement.

The goal: ${task.toLowerCase()}

Given everything you do as ${connection.profession}, this seems like a natural fit. Want to discuss over a call this week?

Would love to reconnect!`,
  ];

  // Rotate through templates
  const index = Math.abs(connection.name.charCodeAt(0)) % messageTemplates.length;
  return messageTemplates[index];
}
