import React, { useState } from 'react';
import ReactGauge from './ReactGauge';
import 'App.css'
function App() {
	const [value, setValue] = useState({ v1: Math.random(), v2: Math.random() })
	const [label, setLabel] = useState("Value")
	const onClickFunc = () => {
		setValue({ v1: Math.random() * 100, v2: Math.random() * 100 })
		setLabel(label === "Value" ? "Previous Value" :  "Value" )
		console.log(label)
	}
	return (
		<div className="App">
			<button onClick={onClickFunc}> Set Value between 0 - 100 </button>
			<ReactGauge value={value.v1} prevValue={value.v2} dGauge labels label={"Value"} prevLabel={"Previous Value"}/>
		</div>
	);
}

export default App;
