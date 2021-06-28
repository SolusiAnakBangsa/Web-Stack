const link = "https://api.gameyourfit.com/workouts/workout/levelpack/default";
const $workouts = document.getElementById("workout-list");
const $save = document.getElementById("save-btn");

const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/json");
editor.setOptions({
	fontSize: "12pt"
});

// Data
let workData = {};

let displaySave = false;

// Current workout index we are working on
let currentIndex = 0;

// Set button trigger to save
$save.addEventListener("click", saveData);

// Detect change for saves
editor.on("change", (m) => {
	if (!displaySave && m.action === "insert") {
		$save.style.display = "block";
		displaySave = true;
	}
});

// Register add workout button
document
.getElementById("add-workout")
.addEventListener("click", addNewWorkout);

// Register upload
document
.getElementById("upload-btn")
.addEventListener("click", submitWorkouts);

// Get json data from the website
fetch(link)
.then(response => response.json())
.then(data => {
	// Insert the data
	workData = data;

	// Add the workout title sidebars
	refreshWorkouts();

	// Load first workout
	displayLevel(0)
})
.catch(() => {
	editor.setValue("Error fetching workout data.");
})

function saveData() {
	// Detect if the code is valid
	if (displaySave) {
		if (editor.getSession().getAnnotations().length == 0) {
			workData.levels[currentIndex] = JSON.parse(editor.getValue());
			alert(
				`${workData.levels[currentIndex].title} Successfully saved!`
			);
		} else {
			alert("There is still errors in the code");
		}
	}
	$save.style.display = "none";
	displaySave = false;
	refreshWorkouts();
}

function refreshWorkouts() {	
	// Reset
	$workouts.innerHTML = "";

	const levels = workData.levels

	// Create each workout names
	for (i in levels) {
		const level = levels[i];

		const el = document.createElement("h3")
		el.innerText = level.title;

		const int = i;
		el.addEventListener("click", () => {
			currentIndex = int
			displayLevel(int)
		});

		$workouts.appendChild(el);
	}
}

function displayLevel(i) {
	editor.setValue(JSON.stringify(workData.levels[i], null, 2));
	$save.style.display = "none";
	displaySave = false;
}

function addNewWorkout() {
	// Add new workout
	workData.levels.push({
		title: "New Workout",
		xp: 0,
		thumbnail: "",
		tasks: [{
			task: "Jog",
			freq: 200
		}]
	})

	// Refresh list
	refreshWorkouts();
	displayLevel(workData.levels.length - 1);
}

function submitWorkouts() {
	fetch(link, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			password: document.getElementById("password").value,
			levels: workData.levels
		})
	}).then(() => {
		alert("Success!");
	}).catch(() => {
		alert("Wrong password!");
	})
}
