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
					createHotfixes: {
						type: "boolean",
						required: true
					},
					deleteHotfixes: {
						type: "boolean",
						required: true
					},
					editHotfixes: {
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
			createHotfixes: {
				type: "boolean",
				required: true
			},
			deleteHotfixes: {
				type: "boolean",
				required: true
			},
			editHotfixes: {
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
			format: "objectId",
			required: true
		},
		originalPosition: {
			type: "integer",
			minimum: 0
		},
		targetColumn: {
			type: "string",
			format: "md5",
			required: true
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
			type: "string",
			minLength: 3,
			maxLength: 50
		},
		email: {
			type: "string",
			minLength: 3,
			maxLength: 50
		},
		password: {
			type: "string",
			minLength: 3,
			maxLength: 50
		},
		isAdmin: {
			type: "boolean"
		}
	}
};

const newUser = Object.assign({}, updateUser);
newUser.required = ['username', 'password', 'email', 'isAdmin'];

const newHotfix = {
	type: "object",
	properties: {
		title: {
			type: "string",
			required: true
		},
		description: {
			type: "string"
		},
		priority: {
			type: "string",
			enum: ['1', '2', '3', '4'],
			required: true
		}
	}
};

const updateHotfix = {
	type: "object",
	properties: {
		title: {
			type: "string",
			required: true
		},
		description: {
			type: "string"
		},
		priority: {
			type: "number",
			minimum: 1,
			maximum: 4,
			required: true
		},
		state: {
			type: "number",
			required: true
		}
	}
};

const paginationQuery = {
	type: 'object',
	properties: {
		limit: {
			type: 'string',
			pattern: "^[0-9]{1,4}$"
		},
		page: {
			type: 'string',
			pattern: "^[0-9]{1,4}$"
		},
	}
};

const getHotfixesQuery = {
	type: 'object',
	properties: {
		showCompleted: {
			type: 'string',
			enum: ['true', 'false']
		}
		// sortByPriority: {
		// 	type: 'string',
		// 	enum: ['ASC', 'DESC']
		// },
		// sortByState: {
		// 	type: 'string',
		// 	enum: ['ASC', 'DESC']
		// },
		// sortByCreation: {
		// 	type: 'string',
		// 	enum: ['ASC', 'DESC']
		// }
	}
};

const globalConfig = {
	type: 'object',
	properties: {
		allowedFileTypes: {
			type: 'array',
			required: true,
			items: {
				type: 'string'
			}
		}
	}
}

Object.assign(getHotfixesQuery.properties, paginationQuery.properties);

module.exports = {newProject, roles, newIssue, moveOperation, updateUser, newUser, newHotfix, paginationQuery, getHotfixesQuery, updateHotfix, globalConfig};