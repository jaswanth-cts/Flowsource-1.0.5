package ${{values.java_package_name}}.exception;

import java.util.function.Predicate;

/*
 * A custom Predicate which evaluates if an exception should be recorded as a failure. 
 * This predicate returns true for all exceptions other than Business Exception
 */
public class RecordFailurePredicate implements Predicate<Throwable> {
    @Override
    public boolean test(Throwable throwable) {
        return !(throwable instanceof BusinessException);
    }
}