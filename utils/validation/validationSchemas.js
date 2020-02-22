const newProject = {
	type: "object",
	properties: {
		name: {
			type: "string",
			required: true
		},
		columns: {
			type: "array",
			minLength: 2,
			required: true,
			items: {
				type: "object",
				properties: {
					name: {
						type: "string",
						required: true
					},
					limit: {
						type: "integer",
						minimum: 0
					}
				}
			}
		},
		description: {
			type: "string"
		},
		roles: {
			type: "array",
			minLength: 1,
			items: {
				type: "object",
				properties: {
					name: {
						type: "string",
						required: true
					},
					isManager: {
						type: "boolean",
						required: true
					},
					isCreator: {
						type: "boolean",
						required: true
					},
					isDestroyer: {
						type: "boolean",
						required: true
					},
					isEditor: {
						type: "boolean",
						required: true
					},
					issueTransitionMatrix: {
						type: "object"
					}
				}
			}
		}
	}
};

// const role = {
// 	type: "object",
// 	properties: {
// 		name: {
// 			type: "string",
// 			required: true
// 		},
// 			isManager: {
// 			type: "boolean",
// 			required: true
// 		},
// 		isCreator: {
// 			type: "boolean",
// 			required: true
// 		},
// 		isDestroyer: {
// 			type: "boolean",
// 			required: true
// 		},
// 		isEditor: {
// 			type: "boolean",
// 			required: true
// 		},
// 		issueTransitionMatrix: {
// 			type: "array",
// 			items: {
// 				type: "object"
// 			}
// 		},
// 		members: {
// 			type: "array",
// 			items: {
// 				type: "string",
// 				format: "objectId"
// 			}
// 		}
// 	}
// };

const roles = {
	type: "array",
	items: {
		type: "object",
		properties: {
			name: {
				type: "string",
				required: true
			},
			isManager: {
				type: "boolean",
				required: true
			},
			isCreator: {
				type: "boolean",
				required: true
			},
			isDestroyer: {
				type: "boolean",
				required: true
			},
			isEditor: {
				type: "boolean",
				required: true
			},
			issueTransitionMatrix: {
				type: "object"
			},
			members: {
				type: "array",
				items: {
					type: "string",
					format: "objectId"
				}
			}
		}
	}
};

const newIssue = {
	type: "object",
	properties: {
		title: {
			type: "string",
			required: true
		},
		description: {
			type: "string"
		},
		checklist: {
			type: "array",
			items: {
				type: "object",
				properties: {
					description: {
						type: "string",
						required: true
					},
					isDone: {
						type: "boolean",
						required: true
					}
				}
			}
		}
	}
};

const moveOperation = {
	type: 'object',
	properties: {
		issueId: {
			type: "string",
			format: "objectId"
		},
		originalPosition: {
			type: "integer",
			minimum: 0,
			required: true
		},
		targetColumn: {
			type: "string",
			format: "md5"
		},
		targetPosition: {
			type: "integer",
			minimum: 0,
			required: true
		}
	}
};

const updateUser = {
	type: 'object',
	properties: {
		username: {
			type: "string"
		},
		email: {
			type: "string"
		},
		password: {
			type: "string"
		},
		isAdmin: {
			type: "boolean"
		}
	}
};

module.exports = {newProject, roles, newIssue, moveOperation, updateUser};