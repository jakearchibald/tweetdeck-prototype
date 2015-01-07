module.exports = function makeIntervalConstructor(compareValues) {

    /**
     * Interval
     * http://en.wikipedia.org/wiki/Interval_(mathematics)
     * https://hackage.haskell.org/package/data-interval-0.4.0/docs/Data-Interval.html
     *
     * Represents a range of data with an associated sort function that defines how values relate
     * to each other. For example, a range of numbers just uses subtraction.
     *
     * Intervals can have inclusive or exclusive bounds, and you can define a custom sort function.
     *
     * To make an Interval, you need to create a constructor:
     *
     *      var Interval = makeIntervalConstructor();
     *
     * By default it will manage integers:
     *
     *      // (0,100] — the numbers 1 to 100
     *      new Interval(
     *          Interval.exclusiveEndpoint(0),
     *          Interval.inclusiveEndpoint(100)
     *      )
     *
     * You can provide a custom sort function to support a different data type:
     *
     *      var DateInterval = makeIntervalConstructor(function sortDates(a, b) {
     *          return a.getTime() - b.getTime();
     *      });
     *
     *      // [12 hours ago,now] — 12 hours ago until now
     *      new DateInterval(
     *          DateInterval.incEnd(
     *              new Date(Date.now() - (1000 * 60 * 60 * 12))
     *          ),
     *          DateInterval.incEnd(
     *              new Date(Date.now())
     *          )
     *      )
     *
     * You can do calculations with two intervals:
     *
     *      i = [1,3]
     *      j = [2,4]
     *      k = [5,6]
     *
     *      i.intersection(j)         // [2,3]
     *      i.hull(j)                 // [1,4]
     *      i.contiguousWith(j)       // true
     *      i.unify(j)                // [1,4]
     *
     *      i.intersection(k)         // Interval.empty
     *      i.hull(k)                 // [1,6]
     *      i.contiguousWith(k)       // false
     *      i.unify(k)                // Interval.empty
     *
     *      i.equalTo(j)              // false
     *      i.contains(2)             // true
     *      i.isSubsetOf(j)           // false
     *
     * If there is no possible unification, the empty set (Interval.empty) results.
     *
     * There are two special intervals:
     *
     *      Interval.empty // {}
     *      Interval.whole // (-Infinity, Infinity)
     *
     * You can also create an interval of value:
     *
     *      Interval.singleton(5) // [5,5]
     *
     * Because of the closed-over sort function, Interval is a bit like a typeclass with an Ordinal
     * type constraint. In Haskell:
     *
     *      data Ord a => Interval a = Interval (EndPoint a, Bool) (Endpoint a, Bool)
     */
    function Interval(from, to) {
        if (!from || !to) {
            throw Error('Interval: missing from/to endpoint(s)');
        }
        this.from = from;
        this.to = to;
        this.empty = this.isEmpty();

        // Normalise values to ensure empty is consistent
        // (prevents incorrectness when comparing bounds. E.g. isSubsetOf)
        if (this.empty) {
            this.from = Interval.posInf;
            this.to = Interval.negInf;
        }
    }

    /**
     * Interval comparison
     */

    Interval.compareValues = compareValues || function (a, b) {
        return (a > b) - (a < b);
    };

    Interval.compareEndpoints = function (a, b) {
        if (a === b) {
            return 0;
        }

        if (a === Interval.negInf || b === Interval.posInf) {
            return -1;
        }
        if (b === Interval.negInf || a === Interval.posInf) {
            return 1;
        }

        return Interval.compareValues(a.value, b.value);
    };

    /*
      Utilities for creating endpoints
     */
    Interval.inclusiveEndpoint = Interval.incEnd = function (value) {
        return {
            value: value,
            finite: true,
            inclusive: true
        };
    };
    Interval.exclusiveEndpoint = Interval.excEnd = function (value) {
        return {
            value: value,
            finite: true,
            inclusive: false
        };
    };
    Interval.adjacentEndpoint = function (endpoint) {
        if (!endpoint.finite) {
            // Infinite is infinite is infinite
            return endpoint;
        }
        // Flip inclusivity bit to make adjacent endpoint
        return endpoint.inclusive ?
            Interval.exclusiveEndpoint(endpoint.value) :
            Interval.inclusiveEndpoint(endpoint.value);
    };

    Interval.negativeInfinity = Interval.negInf = {
        value: -Infinity,
        finite: false,
        inclusive: false
    };
    Interval.positiveInfinity = Interval.posInf = {
        value: Infinity,
        finite: false,
        inclusive: false
    };

    /**
     * Public API
     */

    Interval.prototype.equalTo = function (other) {
        if (this.empty && other.empty) {
            return true;
        }
        if (this.empty !== other.empty) {
            return false;
        }
        return this.fromComparator(this.from, other.from) === 0 &&
               this.toComparator(this.to, other.to) === 0;
    };

    Interval.prototype.intersection = function (other) {
        if (this.empty || other.empty) {
            return Interval.empty;
        }

        var highestFrom = (this.fromComparator(this.from, other.from) > 0) ?
            this.from : other.from;
        var lowestTo = (this.toComparator(this.to, other.to) > 0) ?
            other.to : this.to;

        return new Interval(highestFrom, lowestTo);
    };

    Interval.prototype.complement = function () {
        return {
            before: new Interval(
                Interval.negInf,
                Interval.adjacentEndpoint(this.from)
            ),
            after: new Interval(
                Interval.adjacentEndpoint(this.to),
                Interval.posInf
            )
        };
    };

    Interval.prototype.contiguousWith = function (other) {
        if (this.empty || other.empty) {
            return true;
        }

        // E.g. [a,c] U [b,d] = [a,d]
        var isContiguous = !this.intersection(other).empty;

        if (!isContiguous) {
            // Does an open end-point of one interval match a closed end-point of the other
            // E.g. // [a,b) U [b,c] = [a,c]
            var canConcatThisAndOther = Interval.compareEndpoints(this.to, other.from) === 0 &&
                (this.to.inclusive || other.from.inclusive);
            var canConcatOtherAndThis = Interval.compareEndpoints(other.to, this.from) === 0 &&
                (other.to.inclusive || this.from.inclusive);
            isContiguous = canConcatThisAndOther || canConcatOtherAndThis;
        }

        return isContiguous;
    };

    Interval.prototype.unify = function (other) {
        if (!this.contiguousWith(other)) {
            return Interval.empty;
        }

        return this.hull(other);
    };

    Interval.prototype.hull = function (other) {
        if (this.empty) {
            return other;
        }

        if (other.empty) {
            return this;
        }

        var lowestFrom = (this.fromComparator(this.from, other.from) < 0) ?
            this.from : other.from;
        var highestTo = (this.toComparator(this.to, other.to) < 0) ?
            other.to : this.to;

        return new Interval(lowestFrom, highestTo);
    };

    Interval.prototype.contains = function (value) {
        if (this.empty) {
            return false;
        }
        return !this.intersection(Interval.singleton(value)).empty;
    };

    Interval.prototype.isSubsetOf = function (other) {
        return this.fromComparator(this.from, other.from) >= 0 &&
            this.toComparator(this.to, other.to) <= 0;
    };

    /**
     * Private
     */

    Interval.prototype.fromComparator = function (a, b) {
        var ordering = Interval.compareEndpoints(a, b);
        if (ordering === 0) {
            // Inclusive should sort before exclusive
            ordering = b.inclusive - a.inclusive;
        }
        return ordering;
    };

    Interval.prototype.toComparator = function (a, b) {
        var ordering = Interval.compareEndpoints(a, b);
        if (ordering === 0) {
            // Exclusive should sort before inclusive
            ordering = a.inclusive - b.inclusive;
        }
        return ordering;
    };

    Interval.prototype.toString = function () {
        if (this.empty) {
            return '{}';
        }

        return [
            this.from.inclusive ? '[' : '(',
            (typeof this.from.value === 'object' ?
                JSON.stringify(this.from.value) :
                this.from.value),
            ',',
            (typeof this.to.value === 'object' ?
                JSON.stringify(this.to.value) :
                this.to.value),
            this.to.inclusive ? ']' : ')',
            this.empty ? ' (empty)' : ''
        ].join('');
    };

    Interval.prototype.isEmpty = function () {
        // where a < b,
        // empty is defined as [b,a] or (a,a) or [a,a) or (a,a]
        var bothInclusive = this.from.inclusive && this.to.inclusive;
        var ordering = Interval.compareEndpoints(this.from, this.to);
        return ordering > 0 || // [b,a]
            (ordering === 0 && !bothInclusive); // (a,a) or [a,a) or (a,a]
    };

    /**
     * Utils
     */

    Interval.singleton = function (value) {
        return new Interval(
            Interval.incEnd(value),
            Interval.incEnd(value)
        );
    };

    Interval.empty = new Interval(
        Interval.posInf,
        Interval.negInf
    );

    Interval.whole = new Interval(
        Interval.negInf,
        Interval.posInf
    );

    return Interval;

};
