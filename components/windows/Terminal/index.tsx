import React, { useState, useRef, useEffect } from 'react';

export default function Terminal() {
  const [output, setOutput] = useState<string[]>([
    `Last login: ${new Date().toLocaleString()}`,
    'alex@macbook ~ %'
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const processCommand = (cmd: string) => {
    const newOutput = [...output, `alex@macbook ~ % ${cmd}`];
    
    switch (cmd.toLowerCase()) {
      case 'help':
        newOutput.push('Available commands: help, about, skills, projects, contact, clear, whoami, date');
        break;
      case 'about':
        newOutput.push('Alex Chernysh - Staff Solutions Architect & Glue Engineer');
        break;
      case 'skills':
        newOutput.push('Core: Python, FastAPI, LangGraph, Agentic RAG, LLM Integration, Qdrant, Redis, PostgreSQL, Docker');
        break;
      case 'projects':
        newOutput.push('Key projects: Voyant, E²A, Meulex, Sentio, SYNAPSE AI Dev Framework');
        break;
      case 'contact':
        newOutput.push('Email: alex@hireex.ai | LinkedIn: linkedin.com/in/sasha-chernysh');
        break;
      case 'whoami':
        newOutput.push('alex');
        break;
      case 'date':
        newOutput.push(new Date().toLocaleString());
        break;
      case 'clear':
        setOutput(['alex@macbook ~ %']);
        return;
      default:
        if (cmd.trim()) {
          newOutput.push(`Command not found: ${cmd}. Type 'help' for available commands.`);
        }
    }
    
    newOutput.push('alex@macbook ~ %');
    setOutput(newOutput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processCommand(input);
      setInput('');
    }
  };

  return (
    <div className="font-mono text-sm bg-black text-green-400 p-4 h-full overflow-auto" onClick={() => inputRef.current?.focus()}>
      {output.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap">{line}</div>
      ))}
      <div className="flex">
        <span>alex@macbook ~ % </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-green-400"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
