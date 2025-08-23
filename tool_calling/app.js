import { log } from "console";
import Groq from "groq-sdk";

const groq = new Groq({apiKey: process.env.GROK_API_KEY});

async function main() {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant.
        You have access to following tools:
        1) searchWeb({query}:{query:string}) //search the latest information and realtime data on the internet
        `,
      },
      {
        role: "user",
        content: "iphone 16 launch date?",
      },
    ],
      tools: [
          {
              type: "function",
              function: {
                  name: "webSearch",
                  description: "search the latest information and realtime data on the internet",
                  parameters: {
                      type: "object",
                      properties: {
                          query: {
                              type: "string",
                              description: "the search query to search for",
                          }
                      },
                      required: ["query"],
                  },
              },
          }
      ],
  tool_choice: "auto"
  });

  console.log(JSON.stringify(completion.choices[0].message,null,2));

  const tool_calls = completion.choices[0].message.tool_calls

  if(!tool_calls){
    return;
  }

  for (const tool of tool_calls){
    console.log("tool-> ",tool);
    const functionName = tool.function.name;
    const functionParams = tool.function.arguments;

    if (functionName === "webSearch"){
        const toolResult = await webSearch(JSON.parse(functionParams));
        console.log("toolResult: ", toolResult);
        
    }
    
  }
  
}


main();

async function webSearch({query}) {
    console.log("calling web serach");
    
    return "Iphone 16 was launched on 11 july 2025";
}