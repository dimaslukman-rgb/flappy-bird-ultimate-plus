// Structural contract for game states. JS is structurally typed; this file
// documents the shape each state must satisfy (implemented by convention).
// Methods: async enter(context, payload), async exit(context, nextState),
//        update(context, fixedDt), render(context, alpha), handleAction(context, action) -> boolean.
export const IGameStateContract = Object.freeze({
  methods: ['enter', 'exit', 'update', 'render', 'handleAction'],
});