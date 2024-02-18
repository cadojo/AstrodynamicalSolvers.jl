var documenterSearchIndex = {"docs":
[{"location":"reference/#Reference","page":"AstrodynamicalSolvers","title":"Reference","text":"","category":"section"},{"location":"reference/","page":"AstrodynamicalSolvers","title":"AstrodynamicalSolvers","text":"All exported names.","category":"page"},{"location":"reference/","page":"AstrodynamicalSolvers","title":"AstrodynamicalSolvers","text":"Modules = [\n    AstrodynamicalSolvers,\n]\nOrder = [:module, :type, :function, :constant]","category":"page"},{"location":"reference/#AstrodynamicalSolvers.AstrodynamicalSolvers","page":"AstrodynamicalSolvers","title":"AstrodynamicalSolvers.AstrodynamicalSolvers","text":"Provides astrodynamical solvers, including Lyapunov and halo orbit correctors.\n\nExtended help\n\nLicense\n\nMIT License\n\nCopyright (c) 2023 Joseph D Carpinelli\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\nExports\n\nCR3BSolvers\nhalo\nlyapunov\nmonodromy\n\nImports\n\nAstrodynamicalSolvers.CR3BSolvers\nBase\nCore\nDocStringExtensions\nReexport\n\n\n\n\n\n","category":"module"},{"location":"#AstrodynamicalSolvers.jl","page":"Getting Started","title":"AstrodynamicalSolvers.jl","text":"","category":"section"},{"location":"","page":"Getting Started","title":"Getting Started","text":"Common solvers within orbital mechanics and astrodynamics.","category":"page"},{"location":"#Installation","page":"Getting Started","title":"Installation","text":"","category":"section"},{"location":"","page":"Getting Started","title":"Getting Started","text":"pkg> add AstrodynamicalSolvers","category":"page"},{"location":"#Getting-Started","page":"Getting Started","title":"Getting Started","text":"","category":"section"},{"location":"","page":"Getting Started","title":"Getting Started","text":"This package currently provides periodic orbit, and manifold computations within  Circular Restricted Three Body Problem dynamics.","category":"page"},{"location":"#Periodic-Orbits","page":"Getting Started","title":"Periodic Orbits","text":"","category":"section"},{"location":"","page":"Getting Started","title":"Getting Started","text":"This package contains differential correctors, and helpful wrapper functions, for  finding periodic orbits within Circular Restricted Three Body Problem dynamics.","category":"page"},{"location":"","page":"Getting Started","title":"Getting Started","text":"using AstrodynamicalSolvers\nusing AstrodynamicalModels\nusing OrdinaryDiffEq\nusing Plots\n\nμ = 0.012150584395829193\n\nplanar = let\n    u, T = halo(μ, 1) # lyapunov (planar) orbit\n    u = [u.x, 0, 0, 0, u.ẏ, 0]\n    problem = ODEProblem(CR3BFunction(), u, (0, T), (μ,))\n    solution = solve(problem, Vern9(), reltol=1e-14, abstol=1e-14)\n    plot(solution, idxs=(:x,:y,:z), title = \"Lyapunov Orbit\", label=:none, size=(1600,900), dpi=400, aspect_ratio=1)\nend\n\nextraplanar = let\n    u, T = halo(μ, 2; amplitude=0.01) # halo (non-planar) orbit\n    u = [u.x, 0, u.z, 0, u.ẏ, 0]\n    problem = ODEProblem(CR3BFunction(), u, (0, T), (μ,))\n    solution = solve(problem, Vern9(), reltol=1e-14, abstol=1e-14)\n    plot(solution, idxs=(:x,:y,:z), title = \"Halo Orbit\", label=:none, size=(1600,900), dpi=400, aspect_ratio=1)\nend\n\nplot(planar, extraplanar, layout=(1,2))","category":"page"},{"location":"#Manifold-Computations","page":"Getting Started","title":"Manifold Computations","text":"","category":"section"},{"location":"","page":"Getting Started","title":"Getting Started","text":"Manifold computations, provided by AstrodynamicalCalculations.jl, can perturb  halo orbits onto their unstable or stable manifolds.","category":"page"},{"location":"","page":"Getting Started","title":"Getting Started","text":"using AstrodynamicalSolvers\nusing AstrodynamicalCalculations\nusing AstrodynamicalModels\nusing OrdinaryDiffEq\nusing LinearAlgebra\nusing Plots\n\nμ = 0.012150584395829193\n\nunstable = let\n    u, T = halo(μ, 1; amplitude=0.005)\n\n    u = [u.x, 0, u.z, 0, u.ẏ, 0]\n    Φ = monodromy(u, μ, T)\n\n    ics = let\n        problem = ODEProblem(CR3BFunction(stm=true), vcat(u, vec(I(6))), (0, T), (μ,))\n        solution = solve(problem, Vern9(), reltol=1e-12, abstol=1e-12, saveat=(T / 10))\n\n        solution.u\n    end\n\n    perturbations = [\n        diverge(ic[1:6], reshape(ic[7:end], 6, 6), Φ; eps=-1e-7)\n        for ic in ics\n    ]\n\n    problem = EnsembleProblem(\n        ODEProblem(CR3BFunction(), u, (0.0, 2T), (μ,)),\n        prob_func=(prob, i, repeat) -> remake(prob; u0=perturbations[i]),\n    )\n\n    solution = solve(problem, Vern9(), trajectories=length(perturbations), reltol=1e-14, abstol=1e-14)\nend\n\nstable = let\n    u, T = halo(μ, 2; amplitude=0.005)\n\n    u = [u.x, 0, u.z, 0, u.ẏ, 0]\n    Φ = monodromy(u, μ, T)\n\n    ics = let\n        problem = ODEProblem(CR3BFunction(stm=true), vcat(u, vec(I(6))), (0, T), (μ,))\n        solution = solve(problem, Vern9(), reltol=1e-12, abstol=1e-12, saveat=(T / 10))\n\n        solution.u\n    end\n    \n    perturbations = [\n        converge(ic[1:6], reshape(ic[7:end], 6, 6), Φ; eps=1e-7)\n        for ic in ics\n    ]\n\n    problem = EnsembleProblem(\n        ODEProblem(CR3BFunction(), u, (0.0, -2.1T), (μ,)),\n        prob_func=(prob, i, repeat) -> remake(prob; u0=perturbations[i]),\n    )\n\n    solution = solve(problem, Vern9(), trajectories=length(perturbations), reltol=1e-14, abstol=1e-14)\nend\n\nfigure = plot(; \n    aspect_ratio = 1.0,\n    background = :transparent,\n    grid = true,\n    title = \"Unstable and Stable Invariant Manifolds\",\n    size = (1600,900),\n    dpi = 400,\n)\n\nplot!(figure, unstable, idxs=(:x, :y), aspect_ratio=1, label=:none, palette=:blues)\nplot!(figure, stable, idxs=(:x, :y), aspect_ratio=1, label=:none, palette=:blues)\nscatter!(figure, [1-μ], [0], label=\"Moon\", xlabel=\"X (Earth-Moon Distance)\", ylabel=\"Y (Earth-Moon Distance)\", marker=:x, color=:black, markersize=10,)\n\nfigure # hide","category":"page"},{"location":"cr3bp/#Circular-Restricted-Three-Body-Solvers","page":"CR3BSolvers","title":"Circular Restricted Three Body Solvers","text":"","category":"section"},{"location":"cr3bp/","page":"CR3BSolvers","title":"CR3BSolvers","text":"All three-body solvers!","category":"page"},{"location":"cr3bp/","page":"CR3BSolvers","title":"CR3BSolvers","text":"Modules = [\n    AstrodynamicalSolvers.CR3BSolvers,\n]\nOrder = [:module, :type, :function, :constant]","category":"page"},{"location":"cr3bp/#AstrodynamicalSolvers.CR3BSolvers","page":"CR3BSolvers","title":"AstrodynamicalSolvers.CR3BSolvers","text":"Solvers specific to the Circular Restricted Three Body Problem.\n\nExtended Help\n\nExports\n\nhalo\nlyapunov\nmonodromy\n\nImports\n\nAstrodynamicalCalculations\nAstrodynamicalModels\nBase\nCore\nDocStringExtensions\nLinearAlgebra\nModelingToolkit\nOrdinaryDiffEq\nStaticArrays\n\n\n\n\n\n","category":"module"},{"location":"cr3bp/#AstrodynamicalSolvers.CR3BSolvers.extraplanar_differential-Tuple{AbstractVector, Any}","page":"CR3BSolvers","title":"AstrodynamicalSolvers.CR3BSolvers.extraplanar_differential","text":"extraplanar_differential(state, μ)\n\n\nwarning: CR3BP Dynamics\nThis computation is valid for Circular Restricted Three Body Problem dynamics.\n\nGiven a full state vector for CR3BP dynamics, including vertically concatenated columns of the state transition matrix, return the differential correction term for a periodic orbit.\n\n\n\n\n\n","category":"method"},{"location":"cr3bp/#AstrodynamicalSolvers.CR3BSolvers.halo-NTuple{5, Any}","page":"CR3BSolvers","title":"AstrodynamicalSolvers.CR3BSolvers.halo","text":"halo(x, z, ẏ, μ, T; reltol, abstol, maxiters)\n\n\nwarning: CR3BP Dynamics\nThis computation is valid for Circular Restricted Three Body Problem dynamics.\n\nIterate on an initial guess for halo orbit conditions.\n\n\n\n\n\n","category":"method"},{"location":"cr3bp/#AstrodynamicalSolvers.CR3BSolvers.halo-Tuple{Any, Int64}","page":"CR3BSolvers","title":"AstrodynamicalSolvers.CR3BSolvers.halo","text":"halo(μ, lagrange; amplitude, phase, hemisphere, kwargs...)\n\n\nwarning: CR3BP Dynamics\nThis computation is valid for Circular Restricted Three Body Problem dynamics.\n\nGiven a nondimensional mass parameter μ, and orbit characteristics, construct  an initial guess using Richardson's analytical solution, and iterate on that guess using a differential corrector. \n\n\n\n\n\n","category":"method"},{"location":"cr3bp/#AstrodynamicalSolvers.CR3BSolvers.lyapunov-NTuple{4, Any}","page":"CR3BSolvers","title":"AstrodynamicalSolvers.CR3BSolvers.lyapunov","text":"lyapunov(x, ẏ, μ, T; reltol, abstol, maxiters)\n\n\nwarning: CR3BP Dynamics\nThis computation is valid for Circular Restricted Three Body Problem dynamics.\n\nIterate on an initial guess for Lyapunov orbit conditions.\n\n\n\n\n\n","category":"method"},{"location":"cr3bp/#AstrodynamicalSolvers.CR3BSolvers.monodromy-Tuple{AbstractVector, Any, Any}","page":"CR3BSolvers","title":"AstrodynamicalSolvers.CR3BSolvers.monodromy","text":"monodromy(\n    u,\n    μ,\n    T;\n    algorithm,\n    reltol,\n    abstol,\n    save_everystep,\n    kwargs...\n)\n\n\nwarning: CR3BP Dynamics\nThis computation is valid for Circular Restricted Three Body Problem dynamics.\n\nSolve for the monodromy matrix of the periodic orbit.\n\n\n\n\n\n","category":"method"},{"location":"cr3bp/#AstrodynamicalSolvers.CR3BSolvers.planar_differential-Tuple{AbstractVector, Any}","page":"CR3BSolvers","title":"AstrodynamicalSolvers.CR3BSolvers.planar_differential","text":"planar_differential(state, μ)\n\n\nwarning: CR3BP Dynamics\nThis computation is valid for Circular Restricted Three Body Problem dynamics.\n\nGiven a full state vector for CR3BP dynamics, including vertically concatenated columns of the state transition matrix, return the differential correction term for a planar periodic orbit.\n\n\n\n\n\n","category":"method"}]
}
