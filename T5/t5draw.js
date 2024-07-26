//************************************************************************//
//********************************-T5Draw-********************************//
//************************************************************************//
T5.addOns.draw = ($, p) => {
    $.defineConstant('CLOSE', true);
    $.defineConstant('OPEN', false);
    $.defineConstant('ROUND', 'round');
    $.defineConstant('SQUARE', 'butt');
    $.defineConstant('PROJECT', 'square');
    $.defineConstant('MITER', 'miter');
    $.defineConstant('BEVEL', 'bevel');

    $.defineConstant('RADIUS', 'radius');
    $.defineConstant('CORNER', 'corner');
    $.defineConstant('CORNERS', 'corners');

    $.rect = function (x, y, w, h = w) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            switch ($.currentRectMode) {
                case 'corner':
                    break;
                case 'corners':
                    w = w - x;
                    h = h - y;
                    break;
                case 'center':
                    x = x - w / 2;
                    y = y - h / 2;
                    break;
                case 'radius':
                    x = x - w;
                    y = y - h;
                    w = 2 * w;
                    h = 2 * h;
                    break;
            }

            if ($.borderRadii.length > 0) {
                $.beginShape();
                $.vertex(x, y);
                $.vertex(x + w, y);
                $.vertex(x + w, y + h);
                $.vertex(x, y + h);
                $.endShape(CLOSE);
            } else {
                [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);
                if ($.noAlphaStroke && !$.noAlphaFill) {
                    $.context.fillRect(x, y, w, h);
                } else {
                    $.context.beginPath();
                    $.context.rect(x, y, w, h);
                    if (!$.noAlphaFill) {
                        $.context.fill();
                    }
                    if (!$.noAlphaStroke) {
                        $.context.stroke();
                    }
                }
            }
        }
    };

    $.square = function (x, y, w, h = w) {
        $.rect(x, y, w, h);
    };

    $.fillRect = function (x, y, w, h = w) {
        [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);
        if ($.context) {
            $.context.fillRect(x, y, w, h);
        }
    };

    $.ellipse = function (x, y, w, h = w) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            switch ($.currentEllipseMode) {
                case 'corner':
                    x = x + w / 2;
                    y = y + h / 2;
                    break;
                case 'corners':
                    w = w - x;
                    h = h - y;
                    x = x + w / 2;
                    y = y + h / 2;
                    break;
                case 'center':
                    break;
                case 'radius':
                    w = 2 * w;
                    h = 2 * h;
                    break;
            }

            [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);
            if ($.noAlphaStroke && !$.noAlphaFill) {
                $.fillEllipse(x, y, w, h);
            } else {
                $.context.beginPath();
                $.context.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
                if (!$.noAlphaFill) {
                    $.context.fill();
                }
                if (!$.noAlphaStroke) {
                    $.context.stroke();
                }
            }
        }
    };

    $.circle = function (x, y, d) {
        $.ellipse(x, y, d, d);
    };

    $.fillEllipse = function (x, y, w, h = w) {
        [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);
        if ($.context) {
            $.context.beginPath();
            $.context.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
            $.context.fill();
        }
    };

    $.defineConstant('CHORD', 'chord');
    $.defineConstant('PIE', 'pie');

    $.arc = function (x, y, w, h, start, stop, mode = 'open', counterclockwise = false) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            switch ($.currentEllipseMode) {
                case 'corner':
                    x = x + w / 2;
                    y = y + h / 2;
                    break;
                case 'corners':
                    w = w - x;
                    h = h - y;
                    x = x + w / 2;
                    y = y + h / 2;
                    break;
                case 'center':
                    break;
                case 'radius':
                    w = 2 * w;
                    h = 2 * h;
                    break;
            }

            [x, y, w, h] = $.scaleT5Coords([x, y, w, h]);
            start = $.convertAngle(start);
            stop = $.convertAngle(stop);

            $.context.beginPath();
            $.context.ellipse(x, y, w / 2, h / 2, 0, start, stop, counterclockwise);

            if (mode === 'chord') {
                $.context.lineTo(x + (w / 2) * Math.cos(start), y + (h / 2) * Math.sin(start));
            } else if (mode === 'pie') {
                $.context.lineTo(x, y);
                $.context.closePath();
            }

            if (!$.noAlphaFill) {
                $.context.fill();
            }
            if (!$.noAlphaStroke) {
                $.context.stroke();
            }
        }
    };

    $.line = function (x1, y1, x2, y2) {
        if ($.context) {
            if ($.noAlphaStroke) {
                return;
            }

            [x1, y1, x2, y2] = $.scaleT5Coords([x1, y1, x2, y2]);
            $.context.beginPath();
            $.context.moveTo(x1, y1);
            $.context.lineTo(x2, y2);
            $.context.stroke();
        }
    };

    $.strokeWeight = function (weight) {
        weight = $.scaleT5Coord(weight);
        if (weight == 0) {
            $.context.strokeStyle = 'rgba(0,0,0,0)';
        }
        if ($.context) $.context.lineWidth = weight;
    };

    $.quad = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            if ($.borderRadii.length > 0) {
                $.beginShape();
                $.vertex(x1, y1);
                $.vertex(x2, y2);
                $.vertex(x3, y3);
                $.vertex(x4, y4);
                $.endShape(CLOSE);
            } else {
                [x1, y1, x2, y2, x3, y3, x4, y4] = $.scaleT5Coords([x1, y1, x2, y2, x3, y3, x4, y4]);
                $.context.beginPath();
                $.context.moveTo(x1, y1);
                $.context.lineTo(x2, y2);
                $.context.lineTo(x3, y3);
                $.context.lineTo(x4, y4);
                $.context.closePath();
                if (!$.noAlphaFill) {
                    $.context.fill();
                }
                if (!$.noAlphaStroke) {
                    $.context.stroke();
                }
            }
        }
    };

    $.triangle = function (x1, y1, x2, y2, x3, y3) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            if ($.borderRadii.length > 0) {
                $.beginShape();
                $.vertex(x1, y1);
                $.vertex(x2, y2);
                $.vertex(x3, y3);
                $.endShape(CLOSE);
            } else {
                [x1, y1, x2, y2, x3, y3] = $.scaleT5Coords([x1, y1, x2, y2, x3, y3]);
                $.context.beginPath();
                $.context.moveTo(x1, y1);
                $.context.lineTo(x2, y2);
                $.context.lineTo(x3, y3);
                $.context.closePath();
                if (!$.noAlphaFill) {
                    $.context.fill();
                }
                if (!$.noAlphaStroke) {
                    $.context.stroke();
                }
            }
        }
    };

    let currentShapeVertices = [];
    let currentShapeMode = '';

    $.beginShape = function (mode = 'LINES') {
        currentShapeVertices = [];
        currentShapeMode = mode;
    };

    $.vertex = function (x, y) {
        [x, y] = $.scaleT5Coords([x, y]);
        currentShapeVertices.push({ x, y, type: 'vertex' });
    };

    $.bezierVertex = function (cp1x, cp1y, cp2x, cp2y, x, y) {
        [cp1x, cp1y, cp2x, cp2y, x, y] = $.scaleT5Coords([cp1x, cp1y, cp2x, cp2y, x, y]);
        currentShapeVertices.push({ cp1x, cp1y, cp2x, cp2y, x, y, type: 'bezier' });
    };

    $.curveVertex = function (x, y) {
        [x, y] = $.scaleT5Coords([x, y]);
        currentShapeVertices.push({ x, y, type: 'curve' });
    };

    $.borderRadii = [];

    $.borderRadius = function (...radii) {
        if (radii == null || radii == undefined || radii == 'none') {
            $.borderRadii = [];
        }
        $.borderRadii = radii;
    };
    $.noBorderRadius = function () {
        $.borderRadii = [];
    };

    $.endShape = function (CLOSE) {
        if ($.context && currentShapeVertices.length > 0) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            $.context.beginPath();

            if ($.borderRadii.length > 0) {
                _drawPathWithBorderRadius($.context, currentShapeVertices, CLOSE);
            } else {
                // Check if the shape starts with a curve vertex
                if (currentShapeVertices[0].type === 'curve') {
                    let vertices = [...currentShapeVertices];

                    // Add phantom points at the beginning and end
                    vertices.unshift(vertices[0]);
                    vertices.push(vertices[vertices.length - 1]);

                    // Move to the first actual point
                    $.context.moveTo(vertices[1].x, vertices[1].y);

                    for (let i = 1; i < vertices.length - 2; i++) {
                        let p0 = vertices[i - 1];
                        let p1 = vertices[i];
                        let p2 = vertices[i + 1];
                        let p3 = vertices[i + 2];

                        for (let t = 0; t <= 1; t += 0.1) {
                            let x = 0.5 * ((-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t * t * t +
                                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t * t +
                                (-p0.x + p2.x) * t +
                                2 * p1.x);

                            let y = 0.5 * ((-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t * t * t +
                                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t * t +
                                (-p0.y + p2.y) * t +
                                2 * p1.y);

                            $.context.lineTo(x, y);
                        }
                    }
                    // Line to the last actual point
                    $.context.lineTo(vertices[vertices.length - 2].x, vertices[vertices.length - 2].y);

                } else {
                    // Start at the first vertex if not a curve
                    let startVertex = currentShapeVertices[0];
                    $.context.moveTo(startVertex.x, startVertex.y);

                    for (let i = 1; i < currentShapeVertices.length; i++) {
                        let currentVertex = currentShapeVertices[i];
                        if (currentVertex.type === 'vertex') {
                            $.context.lineTo(currentVertex.x, currentVertex.y);
                        } else if (currentVertex.type === 'bezier') {
                            $.context.bezierCurveTo(
                                currentVertex.cp1x,
                                currentVertex.cp1y,
                                currentVertex.cp2x,
                                currentVertex.cp2y,
                                currentVertex.x,
                                currentVertex.y
                            );
                        } else if (currentVertex.type === 'curve') {
                            // Add phantom points at the beginning and end for curve calculations
                            let p0 = currentShapeVertices[i - 1];
                            let p1 = currentVertex;
                            let p2 = currentShapeVertices[i + 1] || currentVertex;
                            let p3 = currentShapeVertices[i + 2] || p2;

                            for (let t = 0; t <= 1; t += 0.1) {
                                let x = 0.5 * ((-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t * t * t +
                                    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t * t +
                                    (-p0.x + p2.x) * t +
                                    2 * p1.x);

                                let y = 0.5 * ((-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t * t * t +
                                    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t * t +
                                    (-p0.y + p2.y) * t +
                                    2 * p1.y);

                                $.context.lineTo(x, y);
                            }
                        }
                    }
                }

                if (CLOSE) {
                    $.context.closePath();
                }
            }

            if (!$.noAlphaFill) {
                $.context.fill();
            }
            if (!$.noAlphaStroke) {
                $.context.stroke();
            }
            currentShapeVertices = [];
            currentShapeMode = '';
        }
    };

    function _drawPathWithBorderRadius(ctx, vertices, close) {
        if (vertices.length < 2) return;

        const firstVertex = vertices[0];
        const lastVertex = vertices[vertices.length - 1];

        if (close && $.borderRadii.length > 0) {
            const radius = _getBorderRadius(0);
            const prevLine = _calculateLine(lastVertex, firstVertex, radius);
            ctx.moveTo(prevLine.x1, prevLine.y1);
        } else {
            ctx.moveTo(firstVertex.x, firstVertex.y);
        }

        for (let i = 0, len = vertices.length; i < len; i++) {
            const currVertex = vertices[i];
            const nextVertex = vertices[(i + 1) % len];
            const prevVertex = vertices[(i - 1 + len) % len];

            const radius = _getBorderRadius(i);
            if (radius > 0) {
                const prevLine = _calculateLine(prevVertex, currVertex, radius);
                const nextLine = _calculateLine(currVertex, nextVertex, radius);

                if (i > 0) {
                    ctx.lineTo(prevLine.x1, prevLine.y1);
                }

                ctx.quadraticCurveTo(currVertex.x, currVertex.y, nextLine.x0, nextLine.y0);
            } else {
                ctx.lineTo(currVertex.x, currVertex.y);
            }
        }

        if (close) {
            ctx.closePath();
        }
    }

    function _calculateLine(p0, p1, radius) {
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const unitDx = dx / dist;
        const unitDy = dy / dist;

        return {
            x0: p0.x + unitDx * radius,
            y0: p0.y + unitDy * radius,
            x1: p1.x - unitDx * radius,
            y1: p1.y - unitDy * radius
        };
    }

    function _getBorderRadius(index) {
        if ($.borderRadii.length === 0) return 0;
        let radius = $.borderRadii[Math.min(index, $.borderRadii.length - 1)];
        [radius] = $.scaleT5Coords([radius]);
        return radius;
    }

    $.point = function (x, y) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            [x, y] = $.scaleT5Coords([x, y]);
            $.context.save();
            $.context.beginPath();
            $.context.arc(x, y, $.context.lineWidth / 2, 0, Math.PI * 2);
            $.context.fillStyle = $.context.strokeStyle;
            $.context.fill();
            $.context.restore();
        }
    };

    $.fillText = function (text, x, y) {
        if ($.context) {
            [text, x, y] = $.scaleT5Coords([text, x, y]);
            $.context.fillText(text, x, y);
        }
    };

    $.clear = function () {
        if ($.context) {
            $.context.clearRect(0, 0, $.canvas.width, $.canvas.height);
        }
    };

    $.bezier = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            [x1, y1, x2, y2, x3, y3, x4, y4] = $.scaleT5Coords([x1, y1, x2, y2, x3, y3, x4, y4]);
            $.context.beginPath();
            $.context.moveTo(x1, y1);
            $.context.bezierCurveTo(x2, y2, x3, y3, x4, y4);
            $.context.stroke();
        }
    };

    $.bezierCurve = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            [x1, y1, x2, y2, x3, y3, x4, y4] = $.scaleT5Coords([x1, y1, x2, y2, x3, y3, x4, y4]);
            let cp1x = x2 + (x3 - x1) / 6;
            let cp1y = y2 + (y3 - y1) / 6;
            let cp2x = x3 - (x4 - x2) / 6;
            let cp2y = y3 - (y4 - y2) / 6;

            $.context.beginPath();
            $.context.moveTo(x2, y2);
            $.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x3, y3);
            $.context.stroke();
        }
    };

    $.curve = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        if ($.context) {
            if ($.noAlphaFill && $.noAlphaStroke) {
                return;
            }

            [x1, y1, x2, y2, x3, y3, x4, y4] = $.scaleT5Coords([x1, y1, x2, y2, x3, y3, x4, y4]);
            let cp1x = x2 + (x3 - x1) / 6;
            let cp1y = y2 + (y3 - y1) / 6;
            let cp2x = x3 - (x4 - x2) / 6;
            let cp2y = y3 - (y4 - y2) / 6;

            $.context.beginPath();
            $.context.moveTo(x2, y2);
            $.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x3, y3);
            $.context.stroke();
        }
    };
};

T5.addOns.draw(T5.prototype, T5.prototype);
