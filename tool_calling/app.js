import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const groq = new Groq({apiKey: process.env.GROK_API_KEY});
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });



async function main() {

  const messages = [
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
  ]

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: messages,
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

  messages.push(completion.choices[0].message)

  // console.log(JSON.stringify(completion.choices[0].message,null,2));

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
        // console.log("toolResult: ", toolResult);

        messages.push({
          tool_call_id: tool.id,
          role: "tool",
          name: functionName,
          content: toolResult
        })
        
    }    
  }

  const completion2 = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: messages,
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


  console.log(JSON.stringify(completion2.choices[0].message,null,2));


  
}


main();

async function webSearch({query}) {
    console.log("calling web serach");

    const response = await tvly.search(query);

    // console.log("tavly: ",response);

    const finalresult = response.results.map((result) => (result.content)).join("\n\n");
    // console.log("final result, ", finalresult);
    
    
    
    return finalresult;
}