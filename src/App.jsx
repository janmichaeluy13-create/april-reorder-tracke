import React from 'react';

const SalesReorderCallTracker = () => {
  const [calls, setCalls] = React.useState([]);
  const [callInput, setCallInput] = React.useState('');

  const handleAddCall = () => {
    if (callInput) {
      setCalls([...calls, { id: calls.length, text: callInput }]);
      setCallInput('');
    }
  };

  return (
    <div>
      <h1>Sales Reorder Call Tracker</h1>
      <input
        type="text"
        value={callInput}
        onChange={(e) => setCallInput(e.target.value)}
        placeholder="Enter call details"
      />
      <button onClick={handleAddCall}>Add Call</button>
      <ul>
        {calls.map(call => (
          <li key={call.id}>{call.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default SalesReorderCallTracker;