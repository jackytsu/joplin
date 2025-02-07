import { ErrorForbidden } from '../utils/errors';
import { createUserAndSession, beforeAllDb, afterAllTests, beforeEachDb, koaAppContext, koaNext, models, expectHttpError } from '../utils/testing/testUtils';
import ownerHandler from './ownerHandler';

describe('ownerHandler', function() {

	beforeAll(async () => {
		await beforeAllDb('ownerHandler');
	});

	afterAll(async () => {
		await afterAllTests();
	});

	beforeEach(async () => {
		await beforeEachDb();
	});

	test('should login user with valid session ID', async function() {
		const { user, session } = await createUserAndSession(1, false);

		const context = await koaAppContext({
			sessionId: session.id,
		});

		context.joplin.owner = null;

		await ownerHandler(context, koaNext);

		expect(!!context.joplin.owner).toBe(true);
		expect(context.joplin.owner.id).toBe(user.id);
	});

	test('should not login user with invalid session ID', async function() {
		await createUserAndSession(1, false);

		const context = await koaAppContext({
			sessionId: 'ihack',
		});

		context.joplin.owner = null;

		await ownerHandler(context, koaNext);

		expect(!!context.joplin.owner).toBe(false);
	});

	test('should not login if the user has been disabled', async function() {
		const { user, session } = await createUserAndSession(1);

		await models().user().save({ id: user.id, enabled: 0 });

		const context = await koaAppContext({
			sessionId: session.id,
		});

		context.joplin.owner = null;

		await expectHttpError(async () => ownerHandler(context, koaNext), ErrorForbidden.httpCode);
	});

});
