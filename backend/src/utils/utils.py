import numpy as np
from typing import Any, Tuple
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split


def regression(x: list[list[float]], y: list[list[float]]) -> Tuple[float, float]:
    x_train, x_test, y_train, y_test = train_test_split(np.array(flatten(x)).reshape(-1, 1),
                                                        np.array(flatten(y)).reshape(-1, 1),
                                                        train_size=0.8, shuffle=True)
    model = LinearRegression()
    model.fit(x_train, y_train)
    return model.coef_[0][0], model.intercept_[0]


def flatten(xss: list[list[Any]]) -> list[Any]:
    return [x for xs in xss for x in xs]
