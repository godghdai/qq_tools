import time
import asyncio
from functools import wraps


def retry(*exceptions, retries=3, cooldown=1, verbose=True):
    """Decorate an async function to execute it a few times before giving up.
    Hopes that problem is resolved by another side shortly.
    Args:
        exceptions (Tuple[Exception]) : The exceptions expected during function execution
        retries (int): Number of retries of function execution.
        cooldown (int): Seconds to wait before retry.
        verbose (bool): Specifies if we should log about not successful attempts.
    """

    def wrap(func):
        @wraps(func)
        async def inner(*args, **kwargs):
            retries_count = 0

            while True:
                try:
                    result = await func(*args, **kwargs)
                except exceptions as err:
                    retries_count += 1
                    message = "{} Exception during {} execution. {} of {} retries attempted".format(
                        time.strftime('[%Y-%m-%d %H:%M:%S]'), func, retries_count, retries)

                    if retries_count > retries:
                        return None
                    else:
                        verbose and print(message)

                    if cooldown:
                        await asyncio.sleep(cooldown)
                else:
                    return result

        return inner

    return wrap
