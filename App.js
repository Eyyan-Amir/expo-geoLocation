import React from "react";
import { AppState, Text, View } from "react-native";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

const BACKGROUND_FETCH_TASK = "background-fetch";

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
	let { status } = await Location.requestBackgroundPermissionsAsync();
	console.log(status);

	if (status == "granted") {
		let location = await Location.getCurrentPositionAsync({});
		console.log("background :", location);
	}
	return BackgroundFetch.BackgroundFetchResult.NewData;
});

async function registerBackgroundFetchAsync() {
	return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
		minimumInterval: 1, // 1 second
		stopOnTerminate: false, // android only,
		startOnBoot: true, // android only
	});
}

export default function BackgroundFetchScreen() {
	const appState = React.useRef(AppState.currentState);

	const [appStateVisible, setAppStateVisible] = React.useState(appState.current);

	React.useEffect(() => {
		AppState.addEventListener("change", async (nextAppState) => {
			appState.current = nextAppState;
			setAppStateVisible(appState.current);
			if (appState.current == "active") {
				let { status } = await Location.requestForegroundPermissionsAsync();

				if (status == "granted") {
					let location = await Location.getCurrentPositionAsync({});
					setInterval(() => {
						console.log("foreground :", location);
					}, 2000);
				}
			}
		});

		toggleFetchTask();
	}, []);

	const toggleFetchTask = async () => {
		await registerBackgroundFetchAsync();
	};

	return (
		<View>
			<View style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
				<Text style={{ color: "red" }}>background tasks</Text>
				<Text>Current state is: {appStateVisible}</Text>
			</View>
		</View>
	);
}
