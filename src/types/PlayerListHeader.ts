interface PlayerListHeader {
	extra: PlayerListHeaderExtra[];
	text: string;
}

interface PlayerListHeaderExtra {
	bold?: boolean;
	italic?: boolean;
	color?: string;
	text: string;
	extra?: PlayerListHeaderExtraExtra[];
}

interface PlayerListHeaderExtraExtra {
	bold: boolean;
	text: string;
}

export default PlayerListHeader;
