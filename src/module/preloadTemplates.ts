export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "modules/fvtt-canvas/templates"
	];

	return loadTemplates(templatePaths);
}
