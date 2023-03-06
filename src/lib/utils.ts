export const getErrorMessage = (err: any) => {
	if (typeof err === "string") {
		return err.toUpperCase();
	} else if (err instanceof Error) {
		return err.message;
	}
	return null;
};
